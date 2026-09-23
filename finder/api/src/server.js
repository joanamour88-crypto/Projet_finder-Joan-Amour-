import 'dotenv/config';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
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

function authentification(req, res, next) {
    const entete =req.headers.authorization || '';
    const token = entete.split('Bearer','');
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Token invalide' });
    }
};

app.get('/chambres', async (req, res) => {
  const { hotel, date_debut, date_fin, capacite, prix_max, categorie } = req.query;

  const filtre = {};
  if (hotel) filtre.hotelId = Number(hotel);
  if (capacite) filtre.capacite = { gte: Number(capacite) }; //greater than or equal to
  if (prix_max) filtre.prix = { lte: Number(prix_max) }; //less than or equal to
  if (categorie) filtre.categorie = categorie;

  if (date_debut && date_fin && date_debut < date_fin) {

    filtre.reservation = {
      none: {
        statut: 'confirmee',
        dateDepart: { lt: new Date(date_fin)}, //less than
        dateArrivee: { gt: new Date(date_debut) }, //greater than
      },
    };
  } else if (date_debut && date_fin && date_debut > date_fin) {
    res.status(400).json({ error: 'Erreur dans les dates' });
  }

  res.json(await prisma.chambres.findMany({ where: filtre }));
});

app.post('/auth/register', async (req, res) => {
    const {email, motDePasseClaire, nom, prenom, telephone, note } = req.body;
    const hashMDP = await bcrypt.hash(motDePasseClaire, 10);
    await prisma.comptes.create({
        data: {email, motDePasseClaire: hashMDP,note, nom, prenom, telephone, role: "voyageur"},
        select: { id: true, email: true, nom: true, prenom: true, telephone: true , note:true},
    });

    res.status(201).json({ message: 'Compte créé avec succès' });    
});

app.post('/auth/login', async (req, res) => {
    const { email, motDePasseClaire } = req.body;

    const user = await prisma.comptes.findFirst({ where: { email } });
    if (!user || !(await bcrypt.compare(motDePasseClaire, user.motDePasseClaire))) {
        return res.status(401).json({ error: 'Identifiants invalides' });
    };

    /*const ok = await bcrypt.compare(motDePasseClaire, user.motDePasseClaire);
    if (!ok) {
        return res.status(401).json({ error: 'Identifiants invalides' });
    }*/
    //console.log(process.env.JWT_SECRET);
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({ token });
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