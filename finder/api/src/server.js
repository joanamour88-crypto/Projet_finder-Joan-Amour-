import 'dotenv/config';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import express from 'express';

const chambres = JSON.parse(readFileSync(path.join(import.meta.dirname, '..', 'finder-data', 'chambres.json'), 'utf8'));
const hotels = JSON.parse(readFileSync(path.join(import.meta.dirname, '..', 'finder-data', 'hotels.json'), 'utf8'));

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'API en ligne' });
});

//app.get('/chambres', (req, res) => res.json(chambres));
app.get('/hotels', (req, res) => res.json(hotels));
app.get('/comptes', (req, res) => res.json(comptes));
app.get('/reservations', (req, res) => res.json(reservations));


app.get('/chambres/:id', (req, res) => {
    const id = Number(req.params.id);
    const chambre = chambres.find(chambre => chambre.id === id);
    if (!chambre) { 
        return res.status(404).json({ error: 'Chambre non trouvée' });
    }
    res.json(chambre);
});

app.get('/chambres', (req, res) => {
    const prix = Number(req.query.prix_max);
    const chambre = chambres.filter(chambre => chambre.prix_nuit <= prix);
    if (!chambre) { 
        return res.status(404).json({ error: 'Chambre non trouvée' });
    }
    if (isNaN(prix) /*|| chambre.length === 0*/) {
        return res.status(400).json({ error: 'Le prix doit être un nombre' });
    }
    res.json(chambre);
});


app.get('/hotels/:id', (req, res) => {
    const id = Number(req.params.id);
    const hotel = hotels.find(hotel => hotel.id === id);
    if (!hotel) { 
        return res.status(404).json({ error: 'Hôtel non trouvé' });
    }
    res.json(hotel);
});

app.get('/comptes/:id', (req, res) => {
    const id = Number(req.params.id);
    const compte = comptes.find(compte => compte.id === id);
    if (!compte) { 
        return res.status(404).json({ error: 'Compte non trouvé' });
    }
    res.json(compte);
});

app.get('/reservations/:id', (req, res) => {
    const id = Number(req.params.id);
    const reservation = reservations.find(reservation => reservation.id === id);
    if (!reservation) { 
        return res.status(404).json({ error: 'Réservation non trouvée' });
    }
    res.json(reservation);
});

app.get('/hotels/:id', (req, res) => {
    const id = Number(req.params.id);
    const hotel = hotels.find(hotel => hotel.id === id);
    if (!hotel) { 
        return res.status(404).json({ error: 'Hôtel non trouvé' });
    }
    res.json(hotel);
});
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`API écoute sur http://localhost:${PORT}`);
});