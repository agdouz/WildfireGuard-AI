import math
import json
import urllib.request
from typing import List, Tuple, Dict, Any

def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate Great Circle distance in km between two lat/lon points."""
    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class RoutingService:
    def __init__(self):
        # Predefined emergency safe zones (Hospitals, Fire Stations, Safe Command Centers)
        self.preset_safe_zones = [
            {"name": "Caserne de Pompiers - Zone Nord", "lat": 35.7595, "lng": -5.8340, "type": "FireStation"},
            {"name": "Centre Hospitalier Régional", "lat": 34.020882, "lng": -6.841650, "type": "Hospital"},
            {"name": "Base de Secours Atlas", "lat": 31.6300, "lng": -8.0089, "type": "Refuge"},
            {"name": "Poste de Sécurité Civile - Rif", "lat": 35.1683, "lng": -3.9317, "type": "FireStation"},
            {"name": "Zone d'Évacuation Souss", "lat": 30.4278, "lng": -9.5981, "type": "Refuge"},
            {"name": "Centre d'Urgence Grand Atlas", "lat": 31.2000, "lng": -7.8000, "type": "Hospital"},
        ]

    def _fetch_osrm_route(self, waypoints: List[Tuple[float, float]]) -> Dict[str, Any]:
        """
        Fetch driving route from free public OSRM API.
        waypoints format: [(lat, lng), (lat, lng), ...]
        OSRM URL format: .../driving/lon1,lat1;lon2,lat2;lon3,lat3...
        """
        try:
            coord_str = ";".join([f"{lng:.6f},{lat:.6f}" for lat, lng in waypoints])
            url = f"http://router.project-osrm.org/route/v1/driving/{coord_str}?overview=full&geometries=geojson"
            
            req = urllib.request.Request(
                url, 
                headers={'User-Agent': 'WildfireGuardAI/2.0'}
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                data = json.loads(response.read().decode('utf-8'))
                
            if data.get("code") == "Ok" and data.get("routes"):
                route = data["routes"][0]
                coords = route["geometry"]["coordinates"]
                # Convert OSRM GeoJSON [lng, lat] to Leaflet format [lat, lng]
                leaflet_coords = [[lat, lng] for lng, lat in coords]
                distance_km = round(route["distance"] / 1000.0, 2)
                duration_min = round(route["duration"] / 60.0, 1)
                
                return {
                    "success": True,
                    "coordinates": leaflet_coords,
                    "distance_km": distance_km,
                    "duration_min": duration_min
                }
        except Exception as e:
            print(f"[WARN] OSRM API Call failed: {e}")
            
        # Fallback to straight-line interpolation if OSRM is unreachable
        return self._generate_fallback_route(waypoints)

    def _generate_fallback_route(self, waypoints: List[Tuple[float, float]]) -> Dict[str, Any]:
        """Generate smooth interpolated route if external routing API is offline."""
        leaflet_coords = []
        total_dist = 0.0
        
        for i in range(len(waypoints) - 1):
            lat1, lng1 = waypoints[i]
            lat2, lng2 = waypoints[i+1]
            total_dist += haversine(lat1, lng1, lat2, lng2)
            
            # Interpolate 10 points between segments
            for step in range(10):
                t = step / 10.0
                lat = lat1 + t * (lat2 - lat1)
                lng = lng1 + t * (lng2 - lng1)
                leaflet_coords.append([lat, lng])
                
        leaflet_coords.append([waypoints[-1][0], waypoints[-1][1]])
        duration_min = round(total_dist / 60.0 * 60.0, 1) # Assumes ~60 km/h average speed
        
        return {
            "success": True,
            "coordinates": leaflet_coords,
            "distance_km": round(total_dist, 2),
            "duration_min": duration_min,
            "fallback": True
        }

    def _find_nearest_safe_haven(self, fire_lat: float, fire_lng: float, fire_radius_km: float) -> Dict[str, Any]:
        """Find or generate the closest safe destination outside the fire radius circle."""
        best_haven = None
        min_dist = float('inf')

        # Check predefined havens
        for zone in self.preset_safe_zones:
            dist_from_fire = haversine(fire_lat, fire_lng, zone["lat"], zone["lng"])
            if dist_from_fire > fire_radius_km + 2.0:  # Must be at least 2km clear of fire edge
                if dist_from_fire < min_dist:
                    min_dist = dist_from_fire
                    best_haven = zone

        if best_haven:
            return best_haven

        # Dynamic fallback: offset 1.5x fire_radius in north-east direction
        offset_lat = fire_lat + (fire_radius_km * 1.5) / 111.0
        offset_lng = fire_lng + (fire_radius_km * 1.5) / (111.0 * math.cos(math.radians(fire_lat)))
        
        return {
            "name": "Zone Sécurisée Temporaire",
            "lat": round(offset_lat, 4),
            "lng": round(offset_lng, 4),
            "type": "SafeHaven"
        }

    def calculate_evacuation_route(
        self,
        origin_lat: float,
        origin_lng: float,
        fire_lat: float,
        fire_lng: float,
        fire_radius_km: float
    ) -> Dict[str, Any]:
        """
        Calculate an evacuation route from origin to safe haven that avoids passing through the fire circle.
        """
        target_haven = self._find_nearest_safe_haven(fire_lat, fire_lng, fire_radius_km)
        dest_lat, dest_lng = target_haven["lat"], target_haven["lng"]

        # First, try a direct route start -> haven
        direct_route = self._fetch_osrm_route([(origin_lat, origin_lng), (dest_lat, dest_lng)])
        
        # Check if direct route points cross inside the fire radius
        intersects_fire = False
        coords = direct_route.get("coordinates", [])
        
        for p_lat, p_lng in coords:
            if haversine(p_lat, p_lng, fire_lat, fire_lng) <= (fire_radius_km * 1.1):
                intersects_fire = True
                break

        status_msg = "ITINÉRAIRE SÉCURISÉ"
        
        if intersects_fire:
            status_msg = "DÉVIATION INCENDIE APPLIQUÉE"
            # Calculate a detour waypoint perpendicular to the fire-origin vector
            v_lat = origin_lat - fire_lat
            v_lng = origin_lng - fire_lng
            
            # Perpendicular vector (-v_lng, v_lat)
            perp_lat = -v_lng
            perp_lng = v_lat
            norm = math.sqrt(perp_lat**2 + perp_lng**2) or 1.0
            
            # Scale detour waypoint to 1.4x fire radius
            detour_dist_deg = (fire_radius_km * 1.4) / 111.0
            detour_lat = fire_lat + (perp_lat / norm) * detour_dist_deg
            detour_lng = fire_lng + (perp_lng / norm) * detour_dist_deg
            
            # Fetch routed path via detour waypoint: origin -> detour -> destination
            route = self._fetch_osrm_route([
                (origin_lat, origin_lng),
                (detour_lat, detour_lng),
                (dest_lat, dest_lng)
            ])
            route["detour_applied"] = True
            route["detour_waypoint"] = [detour_lat, detour_lng]
        else:
            route = direct_route
            route["detour_applied"] = False

        route["status"] = status_msg
        route["safe_haven"] = target_haven
        route["origin"] = {"lat": origin_lat, "lng": origin_lng}
        route["fire_center"] = {"lat": fire_lat, "lng": fire_lng}
        route["fire_radius_km"] = fire_radius_km
        
        return route

routing_service = RoutingService()
