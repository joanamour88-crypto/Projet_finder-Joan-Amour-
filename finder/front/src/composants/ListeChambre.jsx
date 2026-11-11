export default function ListeChambre({ chambres, onChoix, selectionId }) {
    if (chambres.length === 0) {
        return <p className="text-slate-500 italic">Aucune chambre disponible.</p>;
    }
    return (
            {/*<div>
                {chambres.map(chambre => (
                    <article key={chambre.id}>
                        <h3>Chambre {chambre.numero}</h3>
                        <p>La Catégorie : {chambre.categorie}</p>
                        <p>Le prix par nuit est de : {chambre.prix_nuit} € / nuit</p>
                    </article>
                ))}
            </div>*/},
            <ul className="grid flex-1 grid-cols-2 gap-4 md:grid-cols-3"> 
                {chambres.map(chambre => ( 
                    <li 
                    key={chambre.id}
                    onClick={() => onChoix(chambre)}
                    style={{ cursor: "pointer" }}
                className={
                chambre.id === selectionId
                    ? "cursor-pointer rounded-lg border-2 border-blue-600 bg-blue-50 p-4 shadow"
                    : "cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md"
                }
                    > 
                        <strong>Chambre {chambre.numero}</strong> {chambre.categorie}, {chambre.capacite} personnes - {chambre.prix_nuit} € / nuit
                    </li> 
                ))} 
            </ul> 
    );
}