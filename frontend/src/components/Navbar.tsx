import { Link, useLocation } from 'react-router-dom';

export const Navbar = () => {
    const location = useLocation();

    const navLinks = [
        { path: '/', label: 'Accueil' },
        { path: '/dashboard', label: 'Tableau de Bord' },
        { path: '/detection', label: 'Console IA' },
        { path: '/upload', label: 'Analyse Médias' },
        { path: '/prevention', label: 'Prévention NASA' },
        { path: '/fwi', label: 'Météo Incendie' },
        { path: '/prediction', label: 'Propagation IA' },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background-dark/95 backdrop-blur-md px-4 sm:px-6 py-3 shrink-0 shadow-lg">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
                {/* Brand Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="flex items-center justify-center size-9 rounded-lg bg-primary/20 text-primary border border-primary/30 group-hover:bg-primary group-hover:text-black transition-all">
                        <span className="material-symbols-outlined text-2xl">local_fire_department</span>
                    </div>
                    <div>
                        <span className="text-white font-bold text-lg font-display tracking-wider uppercase">WildfireGuard <span className="text-primary font-extrabold">AI</span></span>
                        <p className="text-[10px] text-primary/70 font-mono tracking-widest leading-none">RÉSEAU DE SURVEILLANCE ET PRÉVENTION</p>
                    </div>
                </Link>

                {/* Navigation Links */}
                <nav className="hidden lg:flex items-center gap-1 rounded-full bg-surface-darker p-1 border border-white/10">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold font-display transition-all ${
                                    isActive
                                        ? 'bg-primary text-black shadow-[0_0_12px_rgba(19,236,91,0.4)]'
                                        : 'text-white/70 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Status Indicator & Home Action */}
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-darker border border-primary/20">
                        <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                        <span className="text-primary text-[11px] font-mono font-bold uppercase tracking-wider">Système En Ligne</span>
                    </div>
                    
                    <Link
                        to="/"
                        className="flex size-9 cursor-pointer items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white hover:bg-primary/20 hover:text-primary transition-all"
                        title="Retour à l'Accueil"
                    >
                        <span className="material-symbols-outlined text-xl">home</span>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
