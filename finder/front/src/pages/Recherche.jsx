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

    useEffect(() => {
        let annule = false;

        const params = new URLSearchParams();
        for (const [cle, valeur] of Object.entries(valides)) {
            if (valeur !== '') params.set(cle, valeur);
        }
        
        fetch(`${API}/chambres?${params.toString()}`)
            .then(response => {
                if (!response.ok) { throw new Error(`Erreur HTTP ! statut : ${response.status}`);}
                return response.json();
            })
            .then(data => { if (!annule) {setChambres(data);}})
            .catch(() => {if (!annule) {setErreur('Service indisponible, réessayez plus tard.')};})
            .finally(() => {if (!annule) {setChargement(false);}});
        return () => {annule = true;};
    }, [valides, version]);

    function changerRecherche(e) {
        setRecherche({ ...recherche, [e.target.name]: e.target.value });
    }

    function verifier(response) {
        if (!response.ok) throw new Error(`Erreur HTTP ! statut : ${response.status}`);
        return response.json();
    }

    function rechercher(e){
        e.preventDefault();
        setChargement(true);
        setErreur(null);
        setValides(recherche);
        setVersion(v => v + 1);
    }

    return (
        <div className="mx-auto max-w-5xl p-6">
            <h1 className="mb-6 text-3xl font-bold text-slate-800">Recherche</h1>
            <form className="space-y-4" onSubmit={rechercher}>
                <div>
                    <label htmlFor="hotel" className="block text-sm font-medium text-gray-700">Hôtel</label>
                    <input type="text" name="hotel" id="hotel" value={recherche.hotel} onChange={changerRecherche} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="date_debut" className="block text-sm font-medium text-gray-700">Date de début</label>
                    <input type="date" name="date_debut" id="date_debut" value={recherche.date_debut} onChange={changerRecherche} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="date_fin" className="block text-sm font-medium text-gray-700">Date de fin</label>
                    <input type="date" name="date_fin" id="date_fin" value={recherche.date_fin} onChange={changerRecherche} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="capacite" className="block text-sm font-medium text-gray-700">Capacité</label>
                    <input type="number" name="capacite" id="capacite" value={recherche.capacite} onChange={changerRecherche} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="prix_max" className="block text-sm font-medium text-gray-700">Prix (Maximum)</label>
                    <input type="number" name="prix_max" id="prix_max" value={recherche.prix_max} onChange={changerRecherche} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="categorie" className="block text-sm font-medium text-gray-700">Catégorie</label>
                    <select name="categorie" id="categorie" value={recherche.categorie} onChange={changerRecherche} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                        <option value="">Toutes</option>
                        <option value="simple">Simple</option>
                        <option value="double">Double</option>
                        <option value="familiale">Familiale</option>
                        <option value="suite">Suite</option>
                    </select>
                </div>
                <div>
                    <button type="submit" className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Rechercher</button>
                </div>
            </form>
            {chargement && <p>Chargement...</p>}
            {erreur && <p role="alert" className="mt-4 text-red-600">{erreur}</p>}
            {!chargement && !erreur && (
                <ListeChambre chambres={chambres} onChoix={setSelection} selectionId={selection?.id} />
            )}
            {selection && (<DetailChambre chambre={selection} onFermer={() => setSelection(null)} />)}
        </div>
    );
}