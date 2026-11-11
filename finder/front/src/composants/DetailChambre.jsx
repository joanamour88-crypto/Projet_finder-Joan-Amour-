export default function DetailChambre({ chambre, onFermer }) {
  return (
    <aside className="w-72 rounded-lg border border-slate-200 bg-white p-6 shadow-md">
      <h2 className="mb-3 text-2xl font-bold">Chambre {chambre.numero}</h2>
      <p className="text-slate-600">Catégorie : {chambre.categorie}</p>
      <p className="text-slate-600">Capacité : {chambre.capacite} personnes</p>
      <p className="text-slate-600">Description : {chambre.description}</p>
      <p className="mt-3 text-xl font-semibold text-blue-700">
        {chambre.prix_nuit} € / nuit
      </p>
      <button
        onClick={onFermer}
        className="mt-5 w-full rounded-md bg-slate-800 px-4 py-2 text-white hover:bg-slate-700"
      >
        Fermer
      </button>
    </aside>
  );
}