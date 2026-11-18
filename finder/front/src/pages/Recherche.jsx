import { useEffect, useState } from "react";
import { API } from "../config.js";
import ListeChambre from "../composants/ListeChambre.jsx";
import FicheHotel from "../composants/FicheHotel.jsx";
import DetailChambre from "../composants/DetailChambre.jsx";

export default function Recherche() {
    const [recherche, setRecherche] = useState({hotel: '', date_debut: '', date_fin: '', capacite: '', prix_max: '', categorie: ''});
    const [chambres, setChambres] = useState([]);
    const [hotel, setHotel] = useState(null);
    const [valides, setValides] = useState({});
    const [version, setVersion] = useState(0);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState(null);
    const [selection, setSelection] = useState(null);

    // Palette : Lin #F7F4EF, Crème #EBE5DC, Charbon #2B2A29, Terracotta #C86D51, Vert sauge #7A8B7A
    const labelClasse = "block text-sm font-medium text-[#2B2A29]";
    const champClasse =
        "mt-1 block w-full rounded-md border-[#7A8B7A] bg-[#F7F4EF] text-[#2B2A29] shadow-sm focus:border-[#C86D51] focus:ring-[#C86D51] sm:text-sm";
    const boutonClasse =
        "inline-flex items-center rounded-md bg-[#C86D51] px-5 py-2.5 text-sm font-medium text-[#2B2A29] shadow-sm transition-colors hover:bg-[#d98163] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7A8B7A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EBE5DC]";

    useEffect(() => {
        let annule = false;

        const params = new URLSearchParams();
        for (const [cle, valeur] of Object.entries(valides)) {
            if (valeur !== '') params.set(cle, valeur);
        }
        
        fetch(`${API}/chambres?${params.toString()}`)
            .then(reponse => {
                if (!reponse.ok) { throw new Error(`Erreur HTTP ! statut : ${reponse.status}`);}
                return reponse.json();
            })
            .then(data => { if (!annule) {setChambres(data);}})
            .catch(() => {if (!annule) {setErreur('Service indisponible, réessayez plus tard.')};})
            .finally(() => {if (!annule) {setChargement(false);}});

        if(valides.hotel){
            fetch(`${API}/hotels/${valides.hotel}`)
            .then(reponse => {
                if (!reponse.ok) { throw new Error(`Erreur HTTP ! statut : ${reponse.status}`);}
                return reponse.json();
            })
            .then(data => {if (!annule) setHotel(data); } )
            .catch(() => {if (!annule) {setErreur('Service indisponible, réessayez plus tard. "hotel"')};})
            .finally(() => {if (!annule) {setChargement(false);}});
        } else {
            setHotel(null); // On efface la fiche si aucun hôtel n'est cherché
        }
        return () => {annule = true;};
    }, [valides, version]);

    function changerRecherche(e) {
        setRecherche({ ...recherche, [e.target.name]: e.target.value });
    }

    function rechercher(e){
        e.preventDefault();
        setChargement(true);
        setSelection(null);
        setErreur(null);
        setValides(recherche);
        setVersion(v => v + 1);
    }

    return (
    <div className="min-h-screen bg-[#F7F4EF]">
        <div className="mx-auto max-w-5xl p-6">
            <h1 className="mb-6 text-3xl font-bold text-[#2B2A29]">Recherche</h1>
            <form className="mb-8 grid gap-4 rounded-2xl bg-[#EBE5DC] p-6 sm:grid-cols-2" onSubmit={rechercher}>
                <div className="sm:col-span-2">
                    <label htmlFor="hotel" className={labelClasse}>Hôtel</label>
                    <input type="text" name="hotel" id="hotel" value={recherche.hotel} onChange={changerRecherche} className={champClasse} />
                </div>
                <div>
                    <label htmlFor="date_debut" className={labelClasse}>Date de début</label>
                    <input type="date" name="date_debut" id="date_debut" value={recherche.date_debut} onChange={changerRecherche} className={champClasse} />
                </div>
                <div>
                    <label htmlFor="date_fin" className={labelClasse}>Date de fin</label>
                    <input type="date" name="date_fin" id="date_fin" value={recherche.date_fin} onChange={changerRecherche} className={champClasse} />
                </div>
                <div>
                    <label htmlFor="capacite" className={labelClasse}>Capacité</label>
                    <input type="number" name="capacite" id="capacite" value={recherche.capacite} onChange={changerRecherche} className={champClasse} />
                </div>
                <div>
                    <label htmlFor="prix_max" className={labelClasse}>Prix (maximum)</label>
                    <input type="number" name="prix_max" id="prix_max" value={recherche.prix_max} onChange={changerRecherche} className={champClasse} />
                </div>
                <div className="sm:col-span-2">
                    <label htmlFor="categorie" className={labelClasse}>Catégorie</label>
                    <select name="categorie" id="categorie" value={recherche.categorie} onChange={changerRecherche} className={champClasse}>
                        <option value="">Toutes</option>
                        <option value="simple">Simple</option>
                        <option value="double">Double</option>
                        <option value="familiale">Familiale</option>
                        <option value="suite">Suite</option>
                    </select>
                </div>
                <div className="sm:col-span-2">
                    <button type="submit" className={boutonClasse}>Rechercher</button>
                </div>
            </form>

            {chargement && <p className="text-[#2B2A29]/70">Chargement...</p>}
            {erreur && <p role="alert" className="mt-4 text-red-700">{erreur}</p>}
            {!chargement && !erreur && hotel && <FicheHotel hotel={hotel} />}
            {!chargement && !erreur && (
                <ListeChambre chambres={chambres} onChoix={setSelection} selectionId={selection?.id} />
            )}
            {selection && (<DetailChambre chambre={selection} onFermer={() => setSelection(null)} />)}
        </div>
    </div>
);
}