import 'dotenv/config';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import express from 'express';
import { PrismaClient } from '../src/generated/prisma/client.ts';

const prisma = new PrismaClient();
//app.use

const chambres = JSON.parse(readFileSync(path.join(import.meta.dirname, '..', 'finder-data', 'chambres.json'), 'utf8'));
const hotels = JSON.parse(readFileSync(path.join(import.meta.dirname, '..', 'finder-data', 'hotels.json'), 'utf8'));

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'API en ligne' });
});

app.get('/chambres', async (req, res) => res.json(await prisma.chambres.findMany()));
app.get('/hotels', async (req, res) => res.json(await prisma.hotels.findMany()));
app.get('/comptes', async (req, res) => res.json(await prisma.comptes.findMany()));
app.get('/reservations', async (req, res) => res.json(await prisma.reservations.findMany()));


app.get('/chambres/:id', async (req, res) => {
    const id = Number(req.params.id);
    const chambre = await prisma.chambres.findUnique({ where: { id } });
    if (!chambre || chambre.length === 0 || isNaN(chambres.id)) { 
        return res.status(404).json({ error: 'Chambre non trouvée' });
    }
    res.json(chambre);
});

app.get('/chambres', async (req, res) => {
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


app.get('/hotels/:id',async (req, res) => {
    const id = Number(req.params.id);
    const hotel = await prisma.hotels.findUnique({ where: { id } });
    if (!hotel) { 
        return res.status(404).json({ error: 'Hôtel non trouvé' });
    }
    res.json(hotel);
});

app.get ('/hotels/:id/chambres', async (req, res) => {
    const id = Number(req.params.id);
    const chambres = await prisma.chambres.findMany({
        where: { hotelId: id },
        //orderBy: { id: 'asc' }
    });
    if (chambres.length === 0) { 
        return res.status(404).json({ error: 'la chambre de l\'hôtel non trouvée' });
    }
    res.json(chambres);
});


app.get('/comptes/:id', async (req, res) => {
    const id = Number(req.params.id);
    const compte = await prisma.comptes.findUnique({ where: { id } });
    if (!compte) { 
        return res.status(404).json({ error: 'Compte non trouvé' });
    }
    res.json(compte);
});

app.get('/reservations/:id', async (req, res) => {
    const id = Number(req.params.id);
    const reservation = await prisma.reservations.findUnique({ where: { id } });
    if (!reservation) { 
        return res.status(404).json({ error: 'Réservation non trouvée' });
    }
    res.json(reservation);
});


const PORT = 3000;

app.listen(PORT, () => {
    console.log(`API écoute sur http://localhost:${PORT}`);
});