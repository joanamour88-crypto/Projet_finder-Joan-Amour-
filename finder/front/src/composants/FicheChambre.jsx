export default function FicheChambre({ chambres, hotel }) {
    if (chambres.length === 0) {
        return <p>Aucune chambre disponible.</p>;
    }
    return (
        <ul className="liste-chambres">
            {chambres.map(chambre => (
                <li key={chambre.numero}>
                     <strong>{chambre.name}</strong> ({chambre.categorie})
                </li>
            ))}
        </ul>
        /*<article>
            <h2>{chambres.name} - {hotel.name}</h2>
            <p>Numéro: {chambres.numero}</p>
            <p>categorie: {chambres.categorie}</p>
            <p>Description: {chambres.description}</p>
        </article>*/
    );
}