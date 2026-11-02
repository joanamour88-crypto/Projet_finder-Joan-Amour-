import FicheHotel from './composants/FicheHotel.jsx';
import FicheChambre from './composants/FicheChambre.jsx';

const hotelTransilvania = {
  name: 'Hotel Transilvania - Le Château de la Terreur ',
  description: 'Place a l\'horreur.',
  adresse: '123 Rue de l\'épouvante',
  ville: '4589658 Transilvania',
  price: '100€ par nuit',
  rating: '4.5 étoiles'
};

const hotelAmor = {
  name: 'Hotel Amor',
  description: 'Un endroit magnifique pour se reposer.',
  adresse: '14 quai des Pêcheurs',
  ville: '17000 La Rochelle',
  price: '150€ par nuit',
  rating: '4.8 étoiles'
};

const chambre1 = {
  name: 'Chambre 1',
  numero: '101',
  categorie: 'Standard',
  description: 'Une chambre confortable avec un lit double.'
};

export default function App() {
  return (
    <div>
      <h1>Finder</h1>
      <div>
        <FicheHotel hotel={hotelTransilvania} />
      </div>
      <div>
        <FicheHotel hotel={hotelAmor} />
      </div>
      <div>
        <FicheChambre chambres={chambre1} hotel={hotelTransilvania} />
      </div>
    </div>
  );
}

