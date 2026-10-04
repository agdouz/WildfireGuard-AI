import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import Navbar from '../components/Navbar';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LocationMarker = () => {
    const map = useMap();
    const [position, setPosition] = useState<[number, number] | null>(null);

    useEffect(() => {
        map.locate().on("locationfound", function (e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
            map.flyTo(e.latlng, map.getZoom());
        });
    }, [map]);

    return position === null ? null : (
        <Marker position={position}>
            <Popup>Vous êtes ici</Popup>
        </Marker>
    );
};

interface WildfireEvent {
    id: string;
    title: string;
    geometries: {
        date: string;
        coordinates: [number, number]; // Long, Lat
    }[];
}

const Dashboard = () => {
    const [logs, setLogs] = useState<WildfireEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWildfires = async () => {
            try {
                const response = await fetch('https://eonet.gsfc.nasa.gov/api/v2.1/events?categories=8&limit=20');
                const data = await response.json();
                if (data.events) {
                    setLogs(data.events);
                }
            } catch (error) {
                console.error("Échec du chargement des incendies:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchWildfires();
        const interval = setInterval(fetchWildfires, 300000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative flex h-screen w-full flex-col bg-background-light dark:bg-background-dark text-slate-900 dark:text-white font-display overflow-x-hidden antialiased selection:bg-primary selection:text-black">
            <Navbar />

            {/* Disposition Principale */}
            <main className="flex-1 overflow-hidden flex flex-col p-4 md:p-6 lg:p-8 gap-6">
                {/* Ligne des Indicateurs Clés (KPI) */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 min-h-[140px]">
                    {/* Bloc Titre */}
                    <div className="flex flex-col justify-center gap-1 lg:col-span-1">
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase">Secteur <span className="text-primary">Alpha-9</span></h1>
                        <div className="flex items-center gap-2 text-white/60">
                            <span className="material-symbols-outlined text-sm">radar</span>
                            <span className="text-sm font-mono">Balayage Actif // Lat: 34.05, Long: -118.24</span>
                        </div>
                    </div>
                    {/* Cartes KPI */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Stat 1 */}
                        <div className="group relative overflow-hidden rounded-xl bg-surface-dark border border-primary/20 p-5 flex flex-col justify-between hover:border-primary/50 transition-colors">
                            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-6xl text-primary">local_fire_department</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <p className="text-white/70 text-sm font-medium uppercase tracking-wider">Menaces Actives</p>
                                <span className="flex items-center text-primary text-xs bg-primary/10 px-2 py-0.5 rounded border border-primary/20 font-mono">
                                    <span className="material-symbols-outlined text-sm mr-1">arrow_upward</span> +1
                                </span>
                            </div>
                            <div className="flex items-end gap-3 mt-2">
                                <p className="text-white text-4xl font-bold leading-none">3</p>
                                <span className="text-red-400 text-sm font-medium animate-pulse">CRITIQUE</span>
                            </div>
                            <div className="w-full bg-white/10 h-1 mt-4 rounded-full overflow-hidden">
                                <div className="bg-red-500 h-full w-[25%] shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                            </div>
                        </div>
                        {/* Stat 2 */}
                        <div className="group relative overflow-hidden rounded-xl bg-surface-dark border border-white/10 p-5 flex flex-col justify-between hover:border-primary/50 transition-colors">
                            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-6xl text-primary">psychology</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <p className="text-white/70 text-sm font-medium uppercase tracking-wider">Confiance IA</p>
                                <span className="flex items-center text-primary text-xs bg-primary/10 px-2 py-0.5 rounded border border-primary/20 font-mono">
                                    <span className="material-symbols-outlined text-sm mr-1">trending_up</span> 0.2%
                                </span>
                            </div>
                            <div className="flex items-end gap-3 mt-2">
                                <p className="text-white text-4xl font-bold leading-none">99.8%</p>
                                <span className="text-primary text-sm font-medium">OPTIMAL</span>
                            </div>
                            <div className="w-full bg-white/10 h-1 mt-4 rounded-full overflow-hidden">
                                <div className="bg-primary h-full w-[99%] shadow-[0_0_10px_rgba(19,236,91,0.5)]"></div>
                            </div>
                        </div>
                        {/* Stat 3 */}
                        <div className="group relative overflow-hidden rounded-xl bg-surface-dark border border-white/10 p-5 flex flex-col justify-between hover:border-primary/50 transition-colors">
                            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-6xl text-primary">shutter_speed</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <p className="text-white/70 text-sm font-medium uppercase tracking-wider">Temps de Réponse</p>
                                <span className="flex items-center text-primary text-xs bg-primary/10 px-2 py-0.5 rounded border border-primary/20 font-mono">
                                    <span className="material-symbols-outlined text-sm mr-1">arrow_downward</span> -2s
                                </span>
                            </div>
                            <div className="flex items-end gap-3 mt-2">
                                <p className="text-white text-4xl font-bold leading-none">14s</p>
                                <span className="text-primary text-sm font-medium">RAPIDE</span>
                            </div>
                            <div className="w-full bg-white/10 h-1 mt-4 rounded-full overflow-hidden">
                                <div className="bg-blue-400 h-full w-[65%] shadow-[0_0_10px_rgba(96,165,250,0.5)]"></div>
                            </div>
                        </div>
                        {/* Stat 4: Prevention */}
                        <Link to="/prevention" className="group relative overflow-hidden rounded-xl bg-surface-dark border border-white/10 p-5 flex flex-col justify-between hover:border-primary/50 transition-colors">
                            <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-6xl text-primary">security</span>
                            </div>
                            <div className="flex justify-between items-start">
                                <p className="text-white/70 text-sm font-medium uppercase tracking-wider">Prévention</p>
                                <span className="flex items-center text-primary text-xs bg-primary/10 px-2 py-0.5 rounded border border-primary/20 font-mono">
                                    <span className="material-symbols-outlined text-sm mr-1">shield</span> ACTIF
                                </span>
                            </div>
                            <div className="flex items-end gap-3 mt-2">
                                <p className="text-white text-4xl font-bold leading-none">NASA</p>
                                <span className="text-primary text-sm font-medium tracking-tighter">EN DIRECT</span>
                            </div>
                            <div className="w-full bg-white/10 h-1 mt-4 rounded-full overflow-hidden">
                                <div className="bg-primary h-full w-[100%] shadow-[0_0_10px_rgba(19,236,91,0.5)] animate-pulse"></div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Contenu Principal: Carte & Flux d'Événements */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 min-h-0">
                    {/* Carte Centrale */}
                    <div className="lg:col-span-3 relative rounded-xl border border-white/10 bg-surface-darker overflow-hidden flex flex-col">
                        <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap gap-2 items-start justify-between pointer-events-none">
                            {/* Filtres */}
                            <div className="flex flex-wrap gap-2 pointer-events-auto bg-surface-darker/80 backdrop-blur rounded-lg p-1.5 border border-white/10">
                                <button className="flex h-8 items-center gap-2 rounded px-3 bg-primary text-surface-darker font-bold text-xs uppercase tracking-wide transition hover:brightness-110">
                                    <span className="material-symbols-outlined text-base">layers</span> Toutes les Couches
                                </button>
                                <button className="flex h-8 items-center gap-2 rounded px-3 bg-white/5 text-white hover:bg-white/10 font-medium text-xs uppercase tracking-wide border border-transparent hover:border-white/10 transition">
                                    <span className="material-symbols-outlined text-base text-red-400">thermostat</span> Thermique
                                </button>
                                <button className="flex h-8 items-center gap-2 rounded px-3 bg-white/5 text-white hover:bg-white/10 font-medium text-xs uppercase tracking-wide border border-transparent hover:border-white/10 transition">
                                    <span className="material-symbols-outlined text-base text-blue-400">air</span> Vent
                                </button>
                                <button className="flex h-8 items-center gap-2 rounded px-3 bg-white/5 text-white hover:bg-white/10 font-medium text-xs uppercase tracking-wide border border-transparent hover:border-white/10 transition">
                                    <span className="material-symbols-outlined text-base text-yellow-400">landscape</span> Topographie
                                </button>
                            </div>
                            <div className="bg-red-500/20 text-red-400 border border-red-500/50 backdrop-blur px-3 py-1 rounded flex items-center gap-2 animate-pulse-slow">
                                <div className="size-2 bg-red-500 rounded-full animate-ping"></div>
                                <span className="text-xs font-bold uppercase tracking-wider">FLUX EN DIRECT</span>
                            </div>
                        </div>

                        <div className="flex-1 relative bg-surface-darker w-full h-full z-0">
                            <MapContainer center={[36.7783, -119.4179]} zoom={10} style={{ height: '100%', width: '100%' }} zoomControl={false} scrollWheelZoom={true}>
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <LocationMarker />

                                <Marker position={[36.85, -119.5]}>
                                    <div className="absolute -inset-4 bg-red-500/20 rounded-full blur-md animate-pulse pointer-events-none"></div>
                                    <Popup className="custom-popup">
                                        <div className="bg-surface-darker border border-red-500/50 p-2 rounded text-xs">
                                            <p className="text-red-400 font-bold mb-1">ALERTE: PIC THERMIQUE</p>
                                            <p className="text-white/80">Temp: 840°C</p>
                                            <p className="text-white/80">Confiance: 98%</p>
                                        </div>
                                    </Popup>
                                </Marker>
                                <Circle center={[36.85, -119.5]} pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.4 }} radius={500} />

                                <Marker position={[36.70, -119.35]}>
                                    <Popup>
                                        <div className="text-xs text-orange-400">Point chaud potentiel</div>
                                    </Popup>
                                </Marker>
                                <Circle center={[36.70, -119.35]} pathOptions={{ color: 'orange', fillColor: 'orange', fillOpacity: 0.4 }} radius={300} />
                            </MapContainer>

                            <div className="absolute inset-0 z-10 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#13ec5b 1px, transparent 1px), linear-gradient(90deg, #13ec5b 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                            </div>

                            <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
                                <div className="w-[500px] h-[500px] border border-primary/10 rounded-full flex items-center justify-center">
                                    <div className="w-[300px] h-[300px] border border-primary/20 rounded-full flex items-center justify-center">
                                        <div className="w-[100px] h-[100px] border border-primary/30 rounded-full animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="h-12 bg-surface-dark border-t border-white/10 flex items-center justify-between px-4 text-xs font-mono text-white/50">
                            <div className="flex gap-4">
                                <span>ÉCHELLE: 1:5000</span>
                                <span>SOURCE: SENTINEL-2, NASA FIRMS</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="size-2 rounded-full bg-primary"></span>
                                <span className="text-primary">SYNCHRONISÉ</span>
                            </div>
                        </div>
                    </div>
                    {/* Colonne Droite: Journal des Incendies Mondial */}
                    <div className="lg:col-span-1 bg-surface-dark rounded-xl border border-white/10 flex flex-col overflow-hidden max-h-[600px] lg:max-h-none">
                        <div className="p-4 border-b border-white/5 bg-surface-darker flex justify-between items-center">
                            <h3 className="text-white font-bold tracking-wide text-sm uppercase flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">public</span> Flux Incendies Mondial
                            </h3>
                            <div className="flex items-center gap-2">
                                {loading && <span className="size-2 rounded-full bg-primary animate-ping"></span>}
                                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/50 border border-white/5">NASA EONET</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1 font-mono text-xs">
                            {logs.map((log) => (
                                <div key={log.id} className="p-2 hover:bg-white/5 rounded transition-colors border-l-2 border-transparent hover:border-primary/50 group border-b border-white/5 last:border-0">
                                    <div className="flex justify-between text-white/40 mb-1">
                                        <span>{new Date(log.geometries[0].date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        <span>#{log.id.split('_')[1]}</span>
                                    </div>
                                    <p className="text-white/90 leading-relaxed">
                                        <span className="text-red-400 font-bold">DÉTECTÉ:</span> {log.title}
                                    </p>
                                    <div className="flex justify-between mt-1 opacity-50 text-[10px]">
                                        <span>Lat: {log.geometries[0].coordinates[1].toFixed(2)}</span>
                                        <span>Long: {log.geometries[0].coordinates[0].toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}

                            {!loading && logs.length === 0 && (
                                <div className="p-4 text-center text-white/30 italic">
                                    Aucun incendie récent renvoyé par NASA EONET.
                                </div>
                            )}

                            <div className="p-2 hover:bg-white/5 rounded transition-colors border-l-2 border-transparent hover:border-primary/50 group opacity-50">
                                <div className="flex justify-between text-white/40 mb-1">
                                    <span>SYSTÈME</span>
                                    <span>#LOC-001</span>
                                </div>
                                <p className="text-white/90 leading-relaxed">
                                    Grille de surveillance locale active.
                                </p>
                            </div>
                        </div>
                        <div className="p-3 bg-surface-darker border-t border-white/5">
                            <div className="flex items-center bg-surface-dark rounded border border-white/10 px-3 py-2">
                                <span className="material-symbols-outlined text-white/30 text-sm mr-2">chevron_right</span>
                                <input className="bg-transparent border-none p-0 text-xs text-white placeholder-white/20 w-full focus:ring-0 font-mono" placeholder="Filtrer les alertes..." type="text" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
