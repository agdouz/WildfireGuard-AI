import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Polyline, useMapEvents, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

import L, { type LeafletMouseEvent } from 'leaflet';
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapController = ({ setCoords }: { setCoords: (c: { lat: number; lng: number }) => void }) => {
    useMapEvents({
        click(e: LeafletMouseEvent) {
            setCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });
    return null;
};

const PredictionDashboard = () => {
    const [coords, setCoords] = useState({ lat: 34.05, lng: -118.24 });
    const [brightness, setBrightness] = useState<number>(330);
    const [confidence, setConfidence] = useState<'High' | 'Low'>('High');
    const [prediction, setPrediction] = useState<any>(null);
    const [evacuationRoute, setEvacuationRoute] = useState<any>(null);
    const [routingLoading, setRoutingLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePredict = async () => {
        setLoading(true);
        setError(null);
        setPrediction(null);
        setEvacuationRoute(null);

        try {
            const response = await fetch('http://localhost:8000/predict/wildfire', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    latitude: coords.lat,
                    longitude: coords.lng,
                    brightness: Number(brightness),
                    confidence: confidence
                })
            });

            if (!response.ok) throw new Error('Échec de la simulation de propagation');

            const data = await response.json();
            setPrediction(data.prediction);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCalculateEvacuationRoute = async () => {
        if (!prediction) return;
        setRoutingLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/routing/evacuation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    origin_lat: coords.lat,
                    origin_lng: coords.lng,
                    fire_lat: coords.lat,
                    fire_lng: coords.lng,
                    fire_radius_km: prediction.radius_km
                })
            });
            const data = await res.json();
            setEvacuationRoute(data);
        } catch (err: any) {
            console.error("Échec du calcul de l'itinéraire d'évacuation:", err);
        } finally {
            setRoutingLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background-dark text-white font-display overflow-hidden">
            <Navbar />
            <div className="flex flex-1 overflow-hidden relative">
            {/* Panneau de Contrôle Technique */}
            <div className="w-[400px] flex flex-col border-r border-white/10 bg-surface-dark relative z-20 shadow-2xl">
                {/* En-tête */}
                <div className="p-6 border-b border-white/10 bg-surface-darker/50 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="size-10 rounded bg-primary/20 flex items-center justify-center border border-primary/30 text-primary">
                            <span className="material-symbols-outlined text-2xl">timeline</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-black uppercase tracking-widest text-white leading-none mb-1">Modèle de Propagation</h1>
                            <p className="text-primary/70 text-[10px] font-mono tracking-widest uppercase">Moteur de Simulation v1.0</p>
                        </div>
                    </div>
                </div>

                {/* Conteneur des Contrôles */}
                <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    {/* Carte de Position */}
                    <div className="bg-surface-darker rounded border border-white/10 p-4 relative group hover:border-primary/30 transition-colors">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                                <span className="size-1.5 rounded-full bg-orange-brand animate-pulse"></span> Point d'Ignition
                            </h3>
                            <span className="material-symbols-outlined text-white/20 group-hover:text-primary transition-colors text-sm">location_on</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="bg-surface-dark rounded border border-white/5 p-2">
                                <label className="block text-[10px] text-white/40 uppercase mb-1">Latitude</label>
                                <div className="font-mono text-sm text-primary">{coords.lat.toFixed(4)}</div>
                            </div>
                            <div className="bg-surface-dark rounded border border-white/5 p-2">
                                <label className="block text-[10px] text-white/40 uppercase mb-1">Longitude</label>
                                <div className="font-mono text-sm text-primary">{coords.lng.toFixed(4)}</div>
                            </div>
                        </div>
                        <p className="text-[10px] text-white/40 italic flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px]">touch_app</span>
                            Cliquer sur la carte pour mettre à jour les coordonnées
                        </p>
                    </div>

                    {/* Paramètres */}
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <label className="text-xs font-bold text-white/70 uppercase tracking-wide">Intensité Lumineuse</label>
                                <span className="font-mono text-primary text-xs bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{brightness}K</span>
                            </div>
                            <input
                                type="range"
                                min="200"
                                max="500"
                                value={brightness}
                                onChange={(e) => setBrightness(Number(e.target.value))}
                                className="w-full h-2 bg-surface-darker rounded-lg appearance-none cursor-pointer accent-primary hover:accent-primary-dim"
                            />
                            <div className="flex justify-between text-[10px] text-white/30 font-mono">
                                <span>200K (Faible)</span>
                                <span>500K (Extrême)</span>
                            </div>
                            <p className="text-[10px] text-white/50 border-l-2 border-primary/30 pl-2 mt-1 py-1">
                                {brightness > 350 ? 'ATTENTION : Signature thermique très élevée. Propagation rapide (+3.0km).' : brightness > 320 ? 'AVERTISSEMENT : Chaleur modérée (+1.5km).' : 'Signature thermique faible.'}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/70 uppercase tracking-wide block">Confiance de Détection</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { key: 'High', label: 'Élevée' },
                                    { key: 'Low', label: 'Faible' }
                                ].map((item) => (
                                    <button
                                        key={item.key}
                                        onClick={() => setConfidence(item.key as 'High' | 'Low')}
                                        className={`py-2 rounded border text-xs font-bold uppercase tracking-wider transition-all ${confidence === item.key
                                                ? 'bg-primary/20 border-primary text-primary shadow-glow'
                                                : 'bg-surface-darker border-white/5 text-white/40 hover:bg-white/5'
                                            }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bouton d'Action */}
                    <button
                        onClick={handlePredict}
                        disabled={loading}
                        className="w-full py-4 bg-primary text-background-dark font-black uppercase tracking-widest text-sm rounded shadow-[0_0_20px_rgba(19,236,91,0.3)] hover:shadow-[0_0_30px_rgba(19,236,91,0.5)] hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">network_intelligence</span>}
                            Lancer la Simulation
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12"></div>
                    </button>

                    {/* Outils secondaires */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                        <button
                            onClick={() => {
                                setBrightness(Math.floor(Math.random() * (400 - 300) + 300));
                                setConfidence(Math.random() > 0.5 ? 'High' : 'Low');
                            }}
                            className="py-2.5 bg-surface-darker hover:bg-[#1a2633] text-white/60 text-[10px] font-bold uppercase tracking-wide rounded border border-white/5 flex items-center justify-center gap-2 transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">casino</span>
                            Aléatoire
                        </button>
                        <a
                            href="https://firms.modaps.eosdis.nasa.gov/map/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 bg-accent-blue/10 hover:bg-accent-blue/20 text-accent-blue text-[10px] font-bold uppercase tracking-wide rounded border border-accent-blue/30 flex items-center justify-center gap-2 transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">public</span>
                            NASA FIRMS
                        </a>
                    </div>
                </div>

                <div className="p-3 bg-background-dark/80 backdrop-blur border-t border-white/5 text-[10px] font-mono text-white/30 flex justify-between">
                    <span>STATUT: EN LIGNE</span>
                    <span>LATENCE: 45ms</span>
                </div>
            </div>

            {/* Rapport d'Analyse de Propagation Overlay */}
            {prediction && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute top-6 left-[424px] z-[500] w-80 bg-surface-dark/95 backdrop-blur-xl border-l-4 border-primary rounded-r-xl border-y border-r border-white/10 shadow-2xl overflow-hidden"
                >
                    <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                        <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">analytics</span>
                            Rapport de Propagation
                        </h3>
                        <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">SIMULÉ</span>
                    </div>

                    <div className="p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-white/50 text-xs uppercase tracking-wide">Rayon Estimé (6h)</span>
                            <span className="text-3xl font-black text-white font-mono">{prediction.radius_km}<span className="text-sm text-primary ml-1">km</span></span>
                        </div>

                        <div className="space-y-2 text-xs font-mono border-t border-white/10 pt-3">
                            <div className="flex justify-between text-white/70">
                                <span>Propagation de Base</span>
                                <span>{prediction.components.base} km</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/50">Facteur Thermique</span>
                                <span className={prediction.components.brightness_factor > 0 ? "text-red-400" : "text-white/30"}>+{prediction.components.brightness_factor} km</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/50">Niveau de Confiance</span>
                                <span className={prediction.components.confidence_factor >= 0 ? "text-red-400" : "text-primary"}>
                                    {prediction.components.confidence_factor > 0 ? '+' : ''}{prediction.components.confidence_factor} km
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/50">Influence du Vent</span>
                                <span className="text-accent-blue">{prediction.components.wind_factor > 0 ? '+' : ''}{prediction.components.wind_factor} km</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCalculateEvacuationRoute}
                            disabled={routingLoading}
                            className="w-full mt-3 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider rounded flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
                        >
                            {routingLoading ? (
                                <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                            ) : (
                                <span className="material-symbols-outlined text-sm">alt_route</span>
                            )}
                            {routingLoading ? "Calcul d'Itinéraire..." : "Calculer Itinéraire Sécurisé"}
                        </button>
                    </div>
                    <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                </motion.div>
            )}

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-6 left-1/2 -translate-x-1/2 z-[2000] bg-red-900/90 border border-red-500/50 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3 backdrop-blur-sm"
                >
                    <span className="material-symbols-outlined text-red-400">error</span>
                    <span className="font-mono text-sm">{error}</span>
                </motion.div>
            )}

            {/* Zone de la Carte Interactive */}
            <div className="flex-1 relative z-10 bg-black">
                <MapContainer
                    center={[coords.lat, coords.lng]}
                    zoom={10}
                    style={{ height: "100%", width: "100%", background: "#051414" }}
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapController setCoords={setCoords} />

                    <Marker position={[coords.lat, coords.lng]}>
                        <Popup className="custom-popup">
                            <div className="text-center">
                                <p className="font-bold text-xs uppercase tracking-wide">Point d'Ignition</p>
                                <p className="text-[10px] opacity-70">Origine de la simulation</p>
                            </div>
                        </Popup>
                    </Marker>

                    {prediction && (
                        <Circle
                            center={[coords.lat, coords.lng]}
                            radius={prediction.radius_km * 1000}
                            pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.2, weight: 1, dashArray: '5, 5' }}
                        >
                            <Popup>
                                <div className="text-center font-mono">
                                    <b className="text-orange-500">ZONE DE PROPAGATION (6H)</b><br />
                                    Rayon : {prediction.radius_km} km
                                </div>
                            </Popup>
                        </Circle>
                    )}

                    {evacuationRoute && evacuationRoute.coordinates && (
                        <>
                            <Polyline
                                positions={evacuationRoute.coordinates}
                                pathOptions={{ color: '#10b981', weight: 5, opacity: 0.9, dashArray: '8, 8' }}
                            />
                            {evacuationRoute.safe_haven && (
                                <Marker position={[evacuationRoute.safe_haven.lat, evacuationRoute.safe_haven.lng]}>
                                    <Popup>
                                        <div className="text-center font-mono">
                                            <b className="text-emerald-400">🛡️ {evacuationRoute.safe_haven.name}</b><br />
                                            Distance: {evacuationRoute.distance_km} km<br />
                                            Temps: {evacuationRoute.duration_min} min
                                        </div>
                                    </Popup>
                                </Marker>
                            )}
                        </>
                    )}
                </MapContainer>

                {evacuationRoute && (
                    <div className="absolute bottom-6 right-6 z-[1000]">
                        <div className="bg-slate-900/90 backdrop-blur border border-emerald-500/40 p-4 rounded-xl shadow-2xl space-y-2 w-72">
                            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-sm">alt_route</span>
                                    {evacuationRoute.status}
                                </span>
                            </div>
                            <div className="text-xs text-slate-300 font-mono space-y-1 pt-1">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Destination :</span>
                                    <span className="text-white font-bold truncate max-w-[150px]">{evacuationRoute.safe_haven?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Distance :</span>
                                    <span className="text-emerald-400 font-bold">{evacuationRoute.distance_km} km</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Temps Estimé :</span>
                                    <span className="text-amber-400 font-bold">{evacuationRoute.duration_min} min</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="absolute top-6 right-6 z-[1000] pointer-events-none">
                    <div className="bg-background-dark/80 backdrop-blur border border-white/10 p-4 rounded-xl shadow-2xl">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">Paramètres du Modèle</p>
                        <ul className="space-y-2 text-[10px] font-mono text-white/70">
                            <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-white/20"></span> Vitesse de Base : 3.0km / 6h</li>
                            <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-red-400"></span> Chaleur {'>'}350K : +3.0km</li>
                            <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-orange-400"></span> Chaleur {'>'}320K : +1.5km</li>
                            <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-accent-blue"></span> Variation Vent : ±2.0km</li>
                        </ul>
                    </div>
                </div>

                <div className="absolute inset-0 pointer-events-none opacity-20 bg-grid-pattern"></div>
            </div>
        </div>
    </div>
);
};

export default PredictionDashboard;
