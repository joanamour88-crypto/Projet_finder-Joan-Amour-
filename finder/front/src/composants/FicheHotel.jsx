export default function FicheHotel({ hotel }) {
    return (
        <article>
            <h2>{hotel.name}</h2>
            <p>{hotel.description}</p>
            <p>Price: {hotel.price}</p>
            <p>Rating: {hotel.rating}</p>
            <p>Adresse: {hotel.adresse}</p>
            <p>Ville: {hotel.ville}</p>
        </article>
    );
}