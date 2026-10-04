import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import HotspotCard from '../components/HotspotCard';
import Navbar from '../components/Navbar';

interface Hotspot {
    lat: number;
    lon: number;
    brightness: number;
    acq_datetime: string;
    confidence: string;
    satellite: string;
    spread_radius_km: number;
    wind_speed_kph?: number;
    wind_direction?: number;
}

const createPulseIcon = (confidence: string) => {
    const isHigh = confidence === 'high' || confidence === 'h';
    const colorClass = isHigh ? 'bg-primary' : 'bg-accent-blue';

    return L.divIcon({
        className: 'custom-div-icon',
        html: `
        <div class="relative flex items-center justify-center">
            <div class="absolute w-12 h-12 ${colorClass}/30 rounded-full animate-ping"></div>
            <div class="absolute w-6 h-6 ${colorClass}/50 rounded-full animate-pulse"></div>
            <span class="material-icons-round text-${isHigh ? 'primary' : 'accent-blue'} text-3xl drop-shadow-md">location_on</span>
        </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 48],
        popupAnchor: [0, -48]
    });
};

const MapController = ({ center, zoom }: { center: [number, number], zoom: number }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, zoom, { duration: 1.5 });
    }, [center, zoom, map]);
    return null;
};

const RealTimePrevention = () => {
    const [hotspots, setHotspots] = useState<Hotspot[]>([]);
    const [loading, setLoading] = useState(false);
    const [region, setRegion] = useState('morocco');
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [darkMode, setDarkMode] = useState(true);
    const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
    const [activeRoute, setActiveRoute] = useState<any>(null);

    const [mapView, setMapView] = useState<{ center: [number, number], zoom: number }>({
        center: [31.7917, -7.0926],
        zoom: 6
    });

    useEffect(() => {
        if (darkMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
    }, [darkMode]);

    const handleCalculateEvacuationRoute = async (hotspot: Hotspot) => {
        try {
            const res = await fetch('http://localhost:8000/api/routing/evacuation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    origin_lat: hotspot.lat,
                    origin_lng: hotspot.lon,
                    fire_lat: hotspot.lat,
                    fire_lng: hotspot.lon,
                    fire_radius_km: hotspot.spread_radius_km || 3.0
                })
            });
            const data = await res.json();
            setActiveRoute(data);
            if (data.safe_haven) {
                setMapView({ center: [hotspot.lat, hotspot.lon], zoom: 10 });
            }
        } catch (err) {
            console.error("Échec du calcul d'itinéraire pour le point chaud:", err);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/api/wildfire/realtime?region=${region}`);
            if (response.ok) {
                const data = await response.json();
                setHotspots(data);
                setLastUpdated(new Date().toLocaleTimeString('fr-FR', { timeZone: 'UTC' }) + ' UTC');

                if (region === 'morocco') setMapView({ center: [31.7917, -7.0926], zoom: 6 });
                else if (region === 'california') setMapView({ center: [36.7783, -119.4179], zoom: 6 });
                else if (region === 'australia') setMapView({ center: [-25.2744, 133.7751], zoom: 5 });
                else if (region === 'global') setMapView({ center: [20, 0], zoom: 2 });
                else setMapView({ center: [20, 0], zoom: 2 });
            } else {
                console.error("Échec du chargement des données");
            }
        } catch (error) {
            console.error("Erreur lors du chargement:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [region]);

    const totalDetected = hotspots.length;
    const highConfidence = hotspots.filter(h => h.confidence === 'high' || h.confidence === 'h').length;

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-100 font-sans h-screen flex flex-col overflow-hidden transition-colors duration-300">
            <Navbar />
            {/* Navigation Header */}
            <header className="bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-700 h-16 flex items-center justify-between px-6 shrink-0 z-30 shadow-md">
                <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                        <span className="material-icons-round text-primary text-2xl animate-pulse">local_fire_department</span>
                        <h1 className="text-xl font-bold tracking-tight text-primary">
                            FireSight <span className="text-slate-500 dark:text-slate-400 font-normal">Prévention NASA</span>
                        </h1>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5 font-mono">Données Satellite NASA FIRMS en Temps Réel</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-icons-round text-slate-400 text-sm">public</span>
                        </div>
                        <select
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            className="bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm rounded-md pl-9 pr-8 py-2 focus:ring-2 focus:ring-primary focus:border-primary shadow-sm transition-colors cursor-pointer outline-none appearance-none"
                        >
                            <option value="morocco">Maroc (Régions)</option>
                            <option value="california">Californie (USA)</option>
                            <option value="australia">Australie</option>
                            <option value="global">Monde Entier</option>
                        </select>
                    </div>

                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium px-4 py-2 rounded-md shadow-lg shadow-orange-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span className={`material-icons-round text-sm ${loading ? 'animate-spin' : ''}`}>refresh</span>
                        {loading ? 'Chargement...' : 'Actualiser'}
                    </button>

                    <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-2 hidden md:block"></div>

                    <div className="hidden md:flex flex-col items-end text-xs text-slate-400 font-mono">
                        <span>Mise à jour: {lastUpdated || '--:--:--'}</span>
                        <span className="text-green-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> En Ligne
                        </span>
                    </div>

                    <button
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                        onClick={() => setDarkMode(!darkMode)}
                    >
                        <span className="material-icons-round dark:hidden">dark_mode</span>
                        <span className="material-icons-round hidden dark:block">light_mode</span>
                    </button>
                </div>
            </header>

            {/* Zone de Contenu */}
            <main className="relative flex-1 w-full overflow-hidden bg-slate-900">
                <div className="absolute inset-0 pointer-events-none z-10 opacity-30"
                    style={{
                        backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }}
                ></div>

                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/90 via-slate-900/20 to-slate-900/90 pointer-events-none z-10"></div>

                {selectedHotspot && (
                    <div className="absolute top-0 right-0 h-full z-[1001] p-4 flex items-center justify-center animate-slide-in-right">
                        <HotspotCard
                            hotspot={selectedHotspot}
                            onClose={() => setSelectedHotspot(null)}
                            onCalculateRoute={handleCalculateEvacuationRoute}
                        />
                    </div>
                )}

                {/* Couches de la carte */}
                <div className="absolute top-6 right-6 z-20">
                    <div className="bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-md border border-slate-300 dark:border-slate-600 rounded-lg shadow-xl p-3 w-48">
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-1">Couches de la Carte</h3>
                        <div className="space-y-1">
                            <label className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                                <input defaultChecked type="checkbox" className="form-checkbox text-primary rounded border-slate-300 bg-transparent focus:ring-primary h-4 w-4" />
                                <span className="text-sm font-medium">Signatures Thermiques</span>
                            </label>
                            <label className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                                <input type="checkbox" className="form-checkbox text-primary rounded border-slate-300 bg-transparent focus:ring-primary h-4 w-4" />
                                <span className="text-sm text-slate-500 dark:text-slate-400">Schémas de Vent</span>
                            </label>
                            <label className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                                <input type="checkbox" className="form-checkbox text-primary rounded border-slate-300 bg-transparent focus:ring-primary h-4 w-4" />
                                <span className="text-sm text-slate-500 dark:text-slate-400">Végétation</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Statut des Points Chauds */}
                <div className="absolute bottom-6 left-6 z-20">
                    <div className="bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl p-5 w-72 transform transition-all hover:scale-[1.02]">
                        <h2 className="text-sm font-bold text-primary uppercase tracking-wide mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            Points Chauds Actifs
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <span className="text-4xl font-mono font-bold text-slate-800 dark:text-white leading-none">{totalDetected}</span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-tight">Total Détecté</span>
                            </div>
                            <div className="flex flex-col border-l border-slate-300 dark:border-slate-700 pl-4">
                                <span className="text-4xl font-mono font-bold text-red-600 dark:text-red-500 leading-none">{highConfidence}</span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-tight">Haute Confiance</span>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Niveau de Risque</span>
                                <span className="text-xs font-bold text-orange-500">{totalDetected > 50 ? 'CRITIQUE' : totalDetected > 10 ? 'ÉLEVÉ' : 'MODÉRÉ'}</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-yellow-400 to-red-600 h-1.5 rounded-full transition-all duration-1000"
                                    style={{ width: `${Math.min(100, (totalDetected / 50) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {activeRoute && (
                    <div className="absolute bottom-6 right-6 z-20">
                        <div className="bg-slate-900/90 backdrop-blur border border-emerald-500/40 p-4 rounded-xl shadow-2xl space-y-2 w-72">
                            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-sm">alt_route</span>
                                    {activeRoute.status}
                                </span>
                            </div>
                            <div className="text-xs text-slate-300 font-mono space-y-1 pt-1">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Destination :</span>
                                    <span className="text-white font-bold truncate max-w-[150px]">{activeRoute.safe_haven?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Distance :</span>
                                    <span className="text-emerald-400 font-bold">{activeRoute.distance_km} km</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Temps Estimé :</span>
                                    <span className="text-amber-400 font-bold">{activeRoute.duration_min} min</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <MapContainer
                    center={mapView.center}
                    zoom={mapView.zoom}
                    zoomControl={false}
                    style={{ height: '100%', width: '100%' }}
                    className="z-0"
                >
                    <MapController center={mapView.center} zoom={mapView.zoom} />
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {hotspots.map((hotspot, idx) => (
                        <Marker
                            key={idx}
                            position={[hotspot.lat, hotspot.lon]}
                            icon={createPulseIcon(hotspot.confidence)}
                            eventHandlers={{
                                click: () => setSelectedHotspot(hotspot)
                            }}
                        />
                    ))}

                    {activeRoute && activeRoute.coordinates && (
                        <>
                            <Polyline
                                positions={activeRoute.coordinates}
                                pathOptions={{ color: '#10b981', weight: 5, opacity: 0.9, dashArray: '8, 8' }}
                            />
                            {activeRoute.safe_haven && (
                                <Marker position={[activeRoute.safe_haven.lat, activeRoute.safe_haven.lng]}>
                                    <Popup>
                                        <div className="text-center font-mono text-slate-900">
                                            <b className="text-emerald-600">🛡️ {activeRoute.safe_haven.name}</b><br />
                                            Distance: {activeRoute.distance_km} km<br />
                                            Temps: {activeRoute.duration_min} min
                                        </div>
                                    </Popup>
                                </Marker>
                            )}
                        </>
                    )}
                </MapContainer>
            </main>
        </div>
    );
};

export default RealTimePrevention;
