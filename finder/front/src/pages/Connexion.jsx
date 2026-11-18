// import { useEffect, useState } from "react";
// import { API } from "../config.js";

// const reponse = await fetch(`${API}/auth/login`, {
//     method:'POST',
//     headers: { 'Content-Type' : 'application/json' },
//     body: JSON.stringify({ email, motDePasse }),
// });
// const { token } = await reponse.json();
// setJeton(token);

// const emprunts = await fetch(`${API}/emprunt/mine`, {
//     headers: { Authorization: `Bearer ${jeton()}`},
// });

// export default function Connexion() {

// }

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../config.js";
import { setJeton } from "../auth.js";

// Palette : Lin #F7F4EF, Crème #EBE5DC, Charbon #2B2A29, Terracotta #C86D51, Vert sauge #7A8B7A
const labelClasse = "block text-sm font-medium text-[#2B2A29]";
const champClasse =
    "mt-1 block w-full rounded-md border-[#7A8B7A] bg-[#F7F4EF] text-[#2B2A29] shadow-sm focus:border-[#C86D51] focus:ring-[#C86D51] sm:text-sm";
const boutonClasse =
    "inline-flex w-full items-center justify-center rounded-md bg-[#C86D51] px-5 py-2.5 text-sm font-medium text-[#2B2A29] shadow-sm transition-colors hover:bg-[#d98163] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A8B7A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EBE5DC] disabled:opacity-60";

export default function Connexion() {
    const [email, setEmail] = useState("");
    const [motDePasse, setMotDePasse] = useState("");
    const [chargement, setChargement] = useState(false);
    const [erreur, setErreur] = useState(null);
    const navigate = useNavigate();

    async function connecter(e) {
        e.preventDefault();
        setErreur(null);
        setChargement(true);

        try {
            const reponse = await fetch(`${API}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, motDePasse }),
            });

            if (!reponse.ok) {
                if (reponse.status === 400 || reponse.status === 401) {
                    setErreur("Email ou mot de passe incorrect.");
                } else {
                    setErreur("Service indisponible, réessayez plus tard.");
                }
                return;
            }

            const { token } = await reponse.json();
            setJeton(token);
            navigate("/recherche");
        } catch {
            setErreur("Service indisponible, réessayez plus tard.");
        } finally {
            setChargement(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#F7F4EF]">
            <div className="mx-auto max-w-md p-6">
                <h1 className="mb-6 text-3xl font-bold text-[#2B2A29]">Connexion</h1>
                <form className="space-y-4 rounded-2xl bg-[#EBE5DC] p-6" onSubmit={connecter}>
                    <div>
                        <label htmlFor="email" className={labelClasse}>Email</label>
                        <input
                            type="email" id="email" name="email" required autoComplete="email"
                            value={email} onChange={e => setEmail(e.target.value)}
                            className={champClasse}
                        />
                    </div>
                    <div>
                        <label htmlFor="motDePasse" className={labelClasse}>Mot de passe</label>
                        <input
                            type="password" id="motDePasse" name="motDePasse" required autoComplete="current-password"
                            value={motDePasse} onChange={e => setMotDePasse(e.target.value)}
                            className={champClasse}
                        />
                    </div>
                    {erreur && <p role="alert" className="text-sm text-red-700">{erreur}</p>}
                    <button type="submit" disabled={chargement} className={boutonClasse}>
                        {chargement ? "Connexion..." : "Se connecter"}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-[#2B2A29]/70">
                    Pas encore de compte ?{" "}
                    <Link to="/inscription" className="font-medium text-[#2B2A29] underline hover:text-[#C86D51]">
                        Inscription
                    </Link>
                </p>
            </div>
        </div>
    );
}