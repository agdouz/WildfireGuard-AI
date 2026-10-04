import { useState, useEffect, useRef } from 'react';
import type { Variants } from 'framer-motion';
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import Navbar from '../components/Navbar';

const Counter = ({ from = 0, to, duration = 2, suffix = "", prefix = "", decimals = 0 }: { from?: number, to: number, duration?: number, suffix?: string, prefix?: string, decimals?: number }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    const count = useMotionValue(from);
    const rounded = useTransform(count, (latest) => {
        return prefix + latest.toFixed(decimals) + suffix;
    });

    useEffect(() => {
        if (inView) {
            animate(count, to, { duration });
        }
    }, [inView, count, to, duration]);

    return <motion.span ref={ref}>{rounded}</motion.span>;
};

const DetectionConsole = () => {
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [prediction, setPrediction] = useState<{ prediction: string, confidence: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Erreur de géolocalisation:", error);
                    setLocationError("Accès à la position refusé");
                }
            );
        } else {
            setLocationError("Géolocalisation non supportée");
        }
    }, []);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
            setPrediction(null);
            setIsLoading(true);

            const formData = new FormData();
            formData.append("file", file);

            try {
                const response = await fetch("http://localhost:8000/predict", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`Erreur API: ${response.statusText}`);
                }

                const data = await response.json();
                console.log("Résultat de prédiction:", data);
                setPrediction(data);
            } catch (error) {
                console.error("Erreur lors de l'analyse:", error);
                alert("Échec de l'analyse de l'image. Vérifiez que le serveur backend est démarré.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12
            }
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white overflow-hidden h-screen flex flex-col">
            <Navbar />

            {/* Zone de Contenu Principal */}
            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Panneau Gauche: Téléversement */}
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex-1 flex flex-col p-6 lg:p-10 border-r border-[#23482f] overflow-y-auto bg-surface-darker/50"
                >
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="max-w-2xl mx-auto w-full flex flex-col h-full"
                    >
                        <motion.div variants={itemVariants} className="mb-8">
                            <h1 className="text-white tracking-tight text-3xl font-bold leading-tight mb-2">Intelligence Visuelle</h1>
                            <p className="text-gray-400 text-base font-normal leading-normal">Téléversez des images satellite ou de drone pour une analyse immédiate des menaces.</p>
                        </motion.div>
                        {/* Zone de Glisser-Déposer */}
                        <motion.div variants={itemVariants} className="flex-1 min-h-[300px] flex flex-col justify-center mb-8">
                            <label htmlFor="dropzone-file" className="group relative flex flex-col items-center justify-center w-full h-full rounded-xl border-2 border-dashed border-[#326744] hover:border-primary/60 bg-[#162b1e] hover:bg-[#1a3324] transition-all duration-300 cursor-pointer overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 z-10 p-6">
                                    <div className="bg-primary/10 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <span className="material-symbols-outlined text-4xl text-primary">add_a_photo</span>
                                    </div>
                                    <p className="mb-2 text-lg text-white font-semibold text-center">Cliquer pour téléverser ou glisser-déposer</p>
                                    <p className="text-xs text-gray-400 text-center">Formats supportés : JPG, PNG, TIFF (Haute Résolution)</p>
                                    <p className="text-xs text-gray-500 mt-4 font-mono">TÉLÉVERSEMENT SÉCURISÉ</p>
                                </div>
                                <input
                                    className="hidden"
                                    id="dropzone-file"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </motion.div>
                        {/* Historique Récent */}
                        <motion.div variants={itemVariants} className="mt-auto">
                            <h3 className="text-white text-sm uppercase tracking-wider font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-base text-gray-400">history</span>
                                Analyses Récentes
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="relative group cursor-pointer rounded-lg overflow-hidden border border-[#23482f] hover:border-primary transition-colors">
                                    <img className="w-full h-24 object-cover opacity-70 group-hover:opacity-100 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDiJxIv7kFXmYrvJhytnJOoPWOhYgMndAfzm7eQnRnTdZAsUlz4urEdz9sijpPs0ECcjJ3svlCAf4W3RCw9K4K8Nhp-g7CQDhZ5IEtzsWAUin9DrSga3iu5HvgF9H_FdXbdI0A2b3Bb1gptb_-O6azb3KuWTQ4tlbs1MqGY-afnLld2O0AgoGmxhWf30cct4xUPmcEGGJOh3aRKQGgN9fXDoJoOeTOBPKhdnqh-ItV7ZuKOk_qAjvq-LL60hthka6NpyBJheRs_Y2Y" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-1 text-[10px] text-white truncate">Secteur 7G</div>
                                </div>
                                <div className="relative group cursor-pointer rounded-lg overflow-hidden border border-[#23482f] hover:border-primary transition-colors">
                                    <img className="w-full h-24 object-cover opacity-70 group-hover:opacity-100 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKL0sbiNFfROU6HSconL34zFHQS0LSkUKwu9_XGiW5v2GaBhzxyDiJUb_DVSlpwaNG3YNIIAnPXn8LUqz734k3xQ4IEqLSwhPGXC0AID3po5e2B5IAFTfdLh2LRPDzi1ZR2FJLzCGEte6szMERNMNqisBn1VBpMtFAExL5lTvmJKr2USLiLDRLRqUC3mSVJovW4Zc2YFGjUPsqgs0BYRet8JFq_wu6Vdf1nb_ObWV1zLlM5-DTIfd397SOFc76VLBBfjpl52Vbbz0" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-1 text-[10px] text-white truncate">Crête Nord</div>
                                </div>
                                <div className="relative group cursor-pointer rounded-lg overflow-hidden border border-[#23482f] hover:border-primary transition-colors">
                                    <img className="w-full h-24 object-cover opacity-70 group-hover:opacity-100 transition-opacity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAi3ReIKHO40S7yHoki8csAcrAaL413c69YydI07X5pQ5bLakVY0Fe_uNBphWkiIQAfKzEhzqij_IsG8Jqpq2zxMvsX3n5AH5Pqbt210K_pMbKzY9hmqnFWkfD3dv3SH8vKPetimjxMSuDWgGspBhbZwT0bFwfTvlWo6u0HNQsVkCai1vT-4IuhlDN47_atyobijHj_SM4Xb4QiRMA9l1A2LGgExCKv12mJmlTBsHSt6GKClEEp7bG9t4XQAqsplqAnoJBgiY_KAu0" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-1 text-[10px] text-white truncate">Zone Alpha</div>
                                </div>
                                <div className="flex items-center justify-center h-24 rounded-lg border border-dashed border-[#326744] hover:bg-[#1a3324] cursor-pointer transition-colors">
                                    <span className="material-symbols-outlined text-gray-500">add</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Panneau Droit: Rapport d'Analyse */}
                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                    className="flex-1 bg-surface-dark flex flex-col p-6 lg:p-10 overflow-y-auto relative"
                >
                    <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#13ec5b 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="relative z-10 flex flex-col h-full max-w-2xl mx-auto w-full gap-6"
                    >
                        <motion.div variants={itemVariants} className="flex justify-between items-center pb-4 border-b border-[#23482f]">
                            <h2 className="text-xl text-white font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">analytics</span>
                                Rapport d'Analyse
                            </h2>
                            {isLoading ? (
                                <span className="px-2 py-1 rounded bg-yellow-900/30 text-yellow-400 text-xs font-mono font-bold border border-yellow-500/50 flex items-center gap-1">
                                    <span className="animate-spin material-symbols-outlined text-sm">sync</span>
                                    ANALYSE EN COURS...
                                </span>
                            ) : prediction ? (
                                <span className={`px-2 py-1 rounded text-xs font-mono font-bold border flex items-center gap-1 ${prediction.prediction === "Fire" ? "bg-[#322323] text-red-400 border-red-900/50" :
                                    prediction.prediction === "Smoke" ? "bg-gray-800 text-gray-300 border-gray-600" :
                                        "bg-green-900/30 text-green-400 border-green-900/50"
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full inline-block ${prediction.prediction === "Fire" ? "bg-red-500 animate-pulse" :
                                        prediction.prediction === "Smoke" ? "bg-gray-400" :
                                            "bg-green-500"
                                        }`}></span>
                                    {prediction.prediction === "Fire" ? "MENACE DÉTECTÉE" : prediction.prediction.toUpperCase()}
                                </span>
                            ) : (
                                <span className="px-2 py-1 rounded bg-gray-900 text-gray-500 text-xs font-mono font-bold border border-gray-800 flex items-center gap-1">
                                    EN ATTENTE D'IMAGE
                                </span>
                            )}
                        </motion.div>

                        <motion.div variants={itemVariants} className="relative aspect-video w-full bg-black rounded-xl overflow-hidden border border-primary/30 shadow-[0_0_20px_rgba(19,236,91,0.1)] group">
                            <img
                                className="w-full h-full object-cover opacity-80"
                                src={selectedImage || "https://lh3.googleusercontent.com/aida-public/AB6AXuD81JaoANYbowO2dSeMqNPaqhygsQoZPa4PFau2tlfiD44PacwYsoig3F28FYhAv3HSr17PcrfCT8MU-ipVFRh5c3OXGS2nMFrElc-n6KtjHI2fRjjvydjNxBv6toN-Z5IpOvwg7EZdgJas-6zFcx1f1MG19IIEtkicOn8HVee7YWeO0zfYCogg1MR82mU-hnGNIbnv8MhddiS-wEKUqeCLDS8QNDBCBAXuCHSSJQURtwDRUbaZSE5qE85EChNXT54Too2DA143mlQ"}
                                alt="Cible d'analyse"
                            />

                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono text-primary border border-primary/20">
                                {selectedImage ? "IMAGE TÉLÉVERSÉE" : "APERÇU DE DÉMONSTRATION"}
                            </div>

                            {(prediction && (prediction.prediction === "Fire" || prediction.prediction === "Smoke")) && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, type: "spring" }}
                                    className={`absolute top-1/4 left-1/4 w-1/3 h-1/3 border-2 shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-start justify-end p-1 ${prediction.prediction === "Fire" ? "border-red-500 bg-red-500/10" : "border-gray-400 bg-gray-500/10"
                                        }`}
                                >
                                    <span className={`text-white text-[10px] font-bold px-1 ${prediction.prediction === "Fire" ? "bg-red-600" : "bg-gray-600"
                                        }`}>
                                        {prediction.prediction === "Fire" ? "INCENDIE" : "FUMÉE"} {(prediction.confidence * 100).toFixed(1)}%
                                    </span>
                                </motion.div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent w-full h-[5%] animate-[scan_3s_ease-in-out_infinite] pointer-events-none"></div>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Carte de Confiance */}
                            <motion.div variants={itemVariants} className="bg-[#112217] border border-[#23482f] p-4 rounded-xl flex items-center gap-4">
                                <div className="relative size-16 shrink-0">
                                    <svg className="size-full" viewBox="0 0 36 36">
                                        <path className="text-[#23482f]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                                        <motion.path
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: prediction ? prediction.confidence : 0 }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className={`${prediction?.prediction === "Fire" ? "text-red-500" : "text-primary"} drop-shadow-[0_0_4px_rgba(239,68,68,0.8)]`}
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeDasharray="100, 100"
                                            strokeWidth="4"
                                        ></motion.path>
                                    </svg>
                                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">
                                            {prediction ? (
                                                <Counter from={0} to={prediction.confidence * 100} suffix="%" duration={1} />
                                            ) : "--"}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider">Confiance IA</p>
                                    <p className="text-white text-lg font-bold">
                                        {prediction ? (prediction.confidence > 0.8 ? "Probabilité Élevée" : "Modérée") : "En attente..."}
                                    </p>
                                    <p className={`${prediction && prediction.confidence > 0.8 ? "text-red-400" : "text-gray-500"} text-xs`}>
                                        {prediction && prediction.confidence > 0.8 ? "Seuil Critique Atteint" : "Analyse en attente"}
                                    </p>
                                </div>
                            </motion.div>
                            {/* Carte des Coordonnées */}
                            <motion.div variants={itemVariants} className="bg-[#112217] border border-[#23482f] p-4 rounded-xl flex flex-col justify-center">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-primary text-sm">near_me</span>
                                    <p className="text-gray-400 text-xs uppercase tracking-wider">Coordonnées GPS</p>
                                </div>
                                <p className="text-white text-lg font-mono tracking-tight">
                                    {location ? `${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° W` : (locationError || "Localisation...")}
                                </p>
                                <p className="text-gray-500 text-xs mt-1">Secteur Régional 4</p>
                            </motion.div>
                            {/* Tableau de Mesures */}
                            <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 bg-[#112217] border border-[#23482f] rounded-xl p-4">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-gray-500 text-xs border-b border-[#23482f]">
                                            <th className="pb-2 font-normal">Métrique</th>
                                            <th className="pb-2 font-normal">Valeur</th>
                                            <th className="pb-2 font-normal text-right">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        <tr className="border-b border-[#23482f]/50">
                                            <td className="py-2 text-white">Classe Détectée</td>
                                            <td className="py-2 text-gray-300">{prediction ? (prediction.prediction === "Fire" ? "Incendie" : prediction.prediction === "Smoke" ? "Fumée" : "Non Incendie") : "--"}</td>
                                            <td className="py-2 text-right">
                                                {prediction ? (
                                                    <span className={prediction.prediction === "Fire" ? "text-red-400" : "text-green-400"}>
                                                        {prediction.prediction === "Fire" ? "Critique" : "Sûr"}
                                                    </span>
                                                ) : "--"}
                                            </td>
                                        </tr>
                                        <tr className="border-b border-[#23482f]/50">
                                            <td className="py-2 text-white">Vitesse du Vent</td>
                                            <td className="py-2 text-gray-300">12 km/h NE</td>
                                            <td className="py-2 text-right"><span className="text-yellow-400">Modéré</span></td>
                                        </tr>
                                        <tr>
                                            <td className="py-2 text-white">Surface Est.</td>
                                            <td className="py-2 text-gray-300">2.4 Hectares</td>
                                            <td className="py-2 text-right"><span className="text-primary">Suivi</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </motion.div>
                        </div>
                        {/* Boutons d'Action */}
                        <motion.div variants={itemVariants} className="mt-auto pt-6 flex gap-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-red-900/20 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">warning</span>
                                SIGNALER L'URGENCE
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
                                whileTap={{ scale: 0.98 }}
                                className="flex-1 bg-transparent border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white font-medium py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">flag</span>
                                Marquer Faux Positif
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
};

export default DetectionConsole;
