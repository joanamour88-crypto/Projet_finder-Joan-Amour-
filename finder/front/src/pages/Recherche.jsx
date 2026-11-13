import { useState } from "react";

export default function Recherche() {
    const [recherche, setRecherche] = useState({hotel: '', date_debut: '', date_fin: '', capacite: '' });

    function changerRecherche(e) {
        setRecherche({ ...recherche, [e.target.name]: e.target.value });
    }
    return (
        <div className="mx-auto max-w-5xl p-6">
            <h1 className="mb-6 text-3xl font-bold text-slate-800">Recherche</h1>
            <form className="space-y-4">
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
                    <button type="submit" className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Rechercher</button>
                </div>
            </form>
        </div>
    );
}