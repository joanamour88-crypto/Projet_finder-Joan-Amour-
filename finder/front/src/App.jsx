import { useState } from "react";
import FicheHotel from './composants/FicheHotel.jsx';
import ListeChambre from './composants/ListeChambre.jsx';
import DetailChambre from './composants/DetailChambre.jsx';

const hotelTransilvania = {
  name: 'Hotel Transilvania - Le Château de la Terreur ',
  description: 'Place a l\'horreur.',
  adresse: '123 Rue de l\'épouvante',
  ville: '4589658 Transilvania',
  prix: '100€ par nuit',
  note: '4.5 étoiles'
};

const hotelAmor = {
  name: 'Hotel Amor',
  description: 'Un endroit magnifique pour se reposer.',
  adresse: '14 quai des Pêcheurs',
  ville: '17000 La Rochelle',
  prix: '150€ par nuit',
  note: '4.8 étoiles'
};

const chambres = [
  {"id": 1, "hotel_id": 1, "numero": "101", "categorie": "simple", "capacite": 1, "prix_nuit": 69, "description": "Lit simple, douche, bureau.", "disponible": true },
  {"id": 2, "hotel_id": 1, "numero": "102", "categorie": "simple", "capacite": 1, "prix_nuit": 69, "description": "Lit simple, douche, bureau.", "disponible": true },
  {"id": 3, "hotel_id": 1, "numero": "103", "categorie": "simple", "capacite": 1, "prix_nuit": 69, "description": "Lit simple, douche, bureau.", "disponible": true },
  {"id": 4,"hotel_id": 1,"numero": "104","categorie": "double","capacite": 2,"prix_nuit": 95,"description": "Lit double, salle de bain, télévision.","disponible": true},
  {"id": 5,"hotel_id": 1,"numero": "105","categorie": "double","capacite": 2,"prix_nuit": 95,"description": "Lit double, salle de bain, télévision.","disponible": true},
  {"id": 6,"hotel_id": 1,"numero": "206","categorie": "double","capacite": 2,"prix_nuit": 95,"description": "Lit double, salle de bain, télévision.","disponible": true},
  {"id": 7,"hotel_id": 1,"numero": "207","categorie": "double","capacite": 2,"prix_nuit": 95,"description": "Lit double, salle de bain, télévision.","disponible": true},
  {"id": 8,"hotel_id": 1,"numero": "208","categorie": "double","capacite": 2,"prix_nuit": 95,"description": "Lit double, salle de bain, télévision.","disponible": true},
  {"id": 9,"hotel_id": 1,"numero": "209","categorie": "double","capacite": 2,"prix_nuit": 95,"description": "Lit double, salle de bain, télévision.","disponible": true},
  {"id": 10,"hotel_id": 1,"numero": "210","categorie": "familiale","capacite": 4,"prix_nuit": 149,"description": "Deux chambres communicantes, salle de bain, coin salon.","disponible": true},
  {"id": 11,"hotel_id": 1,"numero": "211","categorie": "familiale","capacite": 4,"prix_nuit": 149,"description": "Deux chambres communicantes, salle de bain, coin salon.", "disponible": true },
  {"id": 12,"hotel_id": 1,"numero": "212","categorie": "suite","capacite": 2,"prix_nuit": 189,"description": "Grand lit, baignoire, salon séparé, vue dégagée.","disponible": true},
]

export default function App() {
  const [chambre, setChambres] = useState(chambres);
  const [selection, setSelection] = useState(null);

  const nouvelle = { id: 99, numero: 999, categorie: "Test", prixNuit: 1 };

  function ajouterMutation() {
    chambres.push(nouvelle); // même tableau : React ne voit rien
    console.log("Après push :", chambres.length, "chambres dans le tableau");
  }

   function ajouterProprement() {
    setChambres([...chambres, nouvelle]); // tableau neuf : React redessine
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-3xl font-bold text-slate-800">Finder</h1>
      <div>
        <FicheHotel hotel={hotelTransilvania} />
      </div>
      <div>
        <FicheHotel hotel={hotelAmor} />
      </div>
      <button onClick={ajouterMutation}>Ajouter (push)</button>
      <button onClick={ajouterProprement}>Ajouter (tableau neuf)</button>
      {/*<div>
        <ListeChambre chambres={chambres} />
      </div>*/}
      <div className="flex items-start gap-8">
        <ListeChambre chambres={chambres} onChoix={setSelection} selectionId={selection?.id} />
        {selection && (<DetailChambre chambre={selection} onFermer={() => setSelection(null)} />)}
      </div>
    </div>
  );
}

