import 'dotenv/config';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { schemaInscription, schemaConnexion, schemaModifCompte, schemaChambre, schemaGetChambre, schemaModifChambre, schemaReservation } from '../src/schemas.js';

/*const spec = swaggerJsdoc({
    definition: { openapi: '3.0.0', info: { title: 'Finder API', version: '1.0.0' } }, 
    apis: ['src/server.js']
});*/



const prisma = new PrismaClient();
//app.use

const chambres = JSON.parse(readFileSync(path.join(import.meta.dirname, '..', 'finder-data', 'chambres.json'), 'utf8'));
const hotels = JSON.parse(readFileSync(path.join(import.meta.dirname, '..', 'finder-data', 'hotels.json'), 'utf8'));

const app = express();
app.use(express.json());

const spec = swaggerJsdoc({
definition: {
openapi: '3.0.0',
info: { title: 'API', version: '1.0.0' },
components: { securitySchemes: { bearerAuth: { type: 'http', scheme:'bearer', bearerFormat: 'JWT' } } },
},
apis: ['./src/**/*.js'],
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));


app.get('/', (req, res) => {
    res.json({ message: 'API en ligne' });
});

////////////////////////////////////////////// Fonction valider par le schema /////////////////////////////////////////////////////////////////

export function valider(schema) {
    return (req, res, next) => {
        const resultat = schema.safeParse(req.body);
        if (!resultat.success) {
            return res.status(400).json({ erreurs : resultat.error.issues });
        }
        req.body = resultat.data;
        next();
    };
}

////////////////////////////////////////////// Fonction d'authentification /////////////////////////////////////////////////////////////////

function authentification(req, res, next) {
    const entete =req.headers.authorization || '';
    const token = entete.replace('Bearer ', ''); /// .replace() -> permet de remplacer 'Bearer ' par le token
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Token invalide' });
    }
};

////////////////////////////////////////////// Fonction qui exige un rôle /////////////////////////////////////////////////////////////////

function exigeRole(...role){
    return (req, res, next) => {
        role.includes(req.user.role) ? next() : res.status(403).json({ error: 'Accès refusé' });
    }
}
////////////////////////////////////////////// Fonction d'autorisation /////////////////////////////////////////////////////////////////

const TRANSITIONS_AUTORISEES = {
demande: ['accepte', 'refuse'],
accepte: ['rendu', 'annule'],
refuse: [],
rendu: [],
annule: []
};

function transitionValide(statutActuel, statutVoulu) {
    return (TRANSITIONS_AUTORISEES[statutActuel] || []).includes(statutVoulu);
}

////////////////////////////////////////////// Chambres  ////////////////////////////////////////////////////////////////////////////////////////

//-- Get --//
app.get('/chambres', valider(schemaGetChambre), async (req, res) => {
    try {
        const { hotel, date_debut, date_fin, capacite, prix_max, categorie } = req.query;
        console.log('QUERY :', req.query);
        const filtre = {};
        if (hotel) filtre.hotelId = Number(hotel);
        if (capacite) filtre.capacite = { gte: Number(capacite) }; //gte = greater than or equal to
        if (prix_max) filtre.prixNuit = prix_max !== undefined && { lte: Number(prix_max) }; //lte = less than or equal to
        if (categorie) filtre.categorie = categorie;

        ///// Permet d'envoyer une erreur 400 si prix_max n'est pas un nombre ou est vide ///////////////////////////////////////////////
        ///// Generer par claude(Sonnet 5.5)
        ///// 'typeof' -> permet de vérifier le type de la variable 'prix_max' pour s'assurer qu'il s'agit d'une chaîne de caractères. donc que se soit un Int, un float ou un string
        ///// 'trim()' -> permet de supprimer les espaces vides au début et à la fin de la chaîne de caractères. donc si l'utilisateur envoie un string vide, il sera considéré comme invalide
        ///// 'Number.isFinite()' -> permet de vérifier si la valeur convertie en nombre est un nombre fini. donc si l'utilisateur envoie un string qui ne peut pas être converti en nombre, il sera considéré comme invalide
        ///// ↓ /////
        if (prix_max !== undefined) {
            const prixMax = Number(prix_max);

            if (typeof prix_max !== 'string' || prix_max.trim() === '' || !Number.isFinite(prixMax)) {
                return res.status(400).json({ error: "Erreur sur le prix : prix_max doit être un nombre" });
            }
        }
        ///// ↑ /////  

        if (date_debut && date_fin /*&& date_debut < date_fin*/) {
            filtre.reservation = {
                /*none: {
                    statut: "confirmee",
                    dateArrivee: { gt: new Date(date_debut) }, //lt = less than -> plus petit que
                    dateDepart: { lt: new Date(date_fin) } //gt = greater than -> plus grand que
                },*/
                none: {
                    statut: 'confirmee',
                    dateArrivee: { lt: new Date(date_fin) },
                    dateDepart: { gt: new Date(date_debut) },
                },
            };
        } else if (date_debut && date_fin && date_debut > date_fin) {
            return res.status(400).json({ error: 'Erreur dans les dates' });
        }

        console.log('FILTRE :', JSON.stringify(filtre, null, 2));

        res.json(await prisma.chambres.findMany({ where: filtre }));

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de la récupération des chambres" });
    }
    
});

//-- Post --//
app.post('/chambres', authentification, valider(schemaChambre), exigeRole('hotelier'), async (req, res) => {

    const nouvelleChambre = await prisma.chambres.create({
        data: {
            /*numero,
            categorie,
            capacite,
            prixNuit,
            description,
            disponible,*/
            ...req.body,
            hotelId: req.user.hotelId,
        },
    });
    res.status(201).json(nouvelleChambre);
});

//-- Patch --//
app.patch('/chambres/:id', authentification, valider(schemaModifChambre), exigeRole('hotelier'), async (req, res) => {
    const id = parseInt(req.params.id);
    const { numero, categorie, capacite, prixNuit, description, disponible } = req.body;

    const chambre = await prisma.chambres.findUnique({ where: { id } });
    if (!chambre) {
        return res.status(404).json({ error: 'Chambre introuvable' });
    }
    if (chambre.hotelId !== req.user.hotelId) {
        return res.status(403).json({ error: 'Accès refusé' });
    }

    const updated = await prisma.chambres.update({
        where: { id },
        data: { numero, categorie, capacite, prixNuit, description, disponible },
    });

    res.json(updated);
});

//-- Delete --//
app.delete('/chambres/:id', authentification, exigeRole('hotelier'), async (req, res) => {
    const id = parseInt(req.params.id);

    const chambre = await prisma.chambres.findUnique({ where: { id } });
    if (!chambre) {
        return res.status(404).json({ error: 'Chambre introuvable' });
    }
    /*if (chambre.hotelId !== req.user.hotelId) {
        return res.status(403).json({ error: 'Accès refusé' });
    }*/

    await prisma.chambres.delete({ where: { id } });
    res.status(204).send();
});

////////////////////////////////////////////// Hotels ////////////////////////////////////////////////////////////////////////////////////////

//-- Get --//
app.get('/hotels', async (req, res) => {
    try {
        const hotels = await prisma.hotels.findMany({
            orderBy: { id: 'asc' }
        });
        res.json(hotels);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération des hôtels" });
    }
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

////////////////////////////////////////////// Comptes  ////////////////////////////////////////////////////////////////////////////////////////

//-- Get --//
app.get('/comptes/:id', async (req, res) => {
    const id = Number(req.params.id);
    const compte = await prisma.comptes.findUnique({ where: { id } });
    if (!compte) { 
        return res.status(404).json({ error: 'Compte non trouvé' });
    }
    res.json(compte);
});

////////////////////////////////////////////// Reservations  ////////////////////////////////////////////////////////////////////////////////////////

//-- Get --//
app.get('/reservations/:id', valider(schemaReservation), async (req, res) => {
    const id = Number(req.params.id);
    const reservation = await prisma.reservations.findUnique({ where: { id } });
    if (!reservation) { 
        return res.status(404).json({ error: 'Réservation non trouvée' });
    }
    res.json(reservation);
});

app.get('/reservations/mine', async (req, res) => {
    const reservations = await prisma.reservations.findMany({
        where: { reservations: { voyageurId: req.user.voyageurId }}
    })
    if (!reservation) {
        return res.status(404).json({ error: 'Réservation non trouvée' });
    }
    res.json(reservations)
})

app.get('/reservations/received', async (req,res) => {
    const reservations = await prisma.reservations.findMany({
        where: { reservations: { chambreId: req.user.chambreId }}
    })
    if (!reservation) {
        return res.status(404).json({ error: 'Réservation non trouvée' });
    }
    res.json(reservations)
})

//-- Post --//
app.post('/reservations', valider(schemaReservation), async (req, res) => {
    const {dateArrivee, dateDepart, nbPersonnes, statut, demandespe} = req.body;
    try {
        const reservation = await prisma.reservations.create({
            data: {
                dateArrivee: new Date(dateArrivee),
                dateDepart: new Date(dateDepart),
                nbPersonnes,
                statut,
                demandespe,
                voyageurId: req.user.voyageurId,
                chambreId: req.user.chambreId
            }
        });
        res.status(201).json(reservation);
    }
    catch (e) {
        res.status(400).json({ erreur: e.message })
    }
})

//-- Patch --//
app.patch('/reservations/:id', async (req, res)=>{
    const id = parseInt(req.params.id);
    const { dateArrivee, dateDepart, nbPersonnes, statut, demandespe } = req.body;

    const reservations = await prisma.reservations.findUnique({ where: { id } });
    if (!reservations) {
        return res.status(404).json({ error: 'Réservation introuvable' });
    }
    if (transitionValide(reservations.statut, 'confirmee')) {
        return res.status(403).json({ error: 'Accès refusé' });
    }

    const updated = await prisma.reservations.update({
        where: { id },
        data: { dateArrivee, dateDepart, nbPersonnes, statut, demandespe },
    });

    res.json(updated);
})

//-- Delete --//
app.delete('/reservations/:id', async (req, res) =>{
    try{
        const id = parseInt(req.params.id);
        await prisma.reservations.delete({ where: { id }})
        res.status(204).send();
    } catch {
        res.status(404).json({ erreur: 'reservation inexistante'})
    }
})

////////////////////////////////////////////// Voyageurs  ////////////////////////////////////////////////////////////////////////////////////////

//-- Get --//
app.get('/voyageur/me', authentification, exigeRole('voyageur'), async (req, res) => {
    const voyageur = await prisma.comptes.findUnique({ where: { id: req.user.id } });
    if (!voyageur) {
        return res.status(404).json({ error: 'Voyageur non trouvé' });
    }
    res.json({ nom: voyageur.nom, prenom: voyageur.prenom, telephone: voyageur.telephone });
});

app.patch('/voyageur/me', authentification, valider(schemaModifCompte), exigeRole('voyageur'), async (req, res) => {
    const { nom, prenom, telephone } = req.body;
    const voyageur = await prisma.comptes.update({
        where: { id: req.user.id },
        data: { nom, prenom, telephone }
    });
    if (!voyageur) {
        return res.status(404).json({ error: 'Voyageur non trouvé' });
    }
    res.json(voyageur);
});

////////////////////////////////////////////// Authentification (création, connexion et deconnexion)  ////////////////////////////////////////////////////////////////////////////////////////

app.post('/auth/register', valider(schemaInscription), async (req, res) => {
    const {email, motDePasseClaire, nom, prenom, telephone, note } = req.body;
    const hashMDP = await bcrypt.hash(motDePasseClaire, 10);
    await prisma.comptes.create({
        data: {email, motDePasseClaire: hashMDP,note, nom, prenom, telephone, role: "voyageur"},
        select: { id: true, email: true, nom: true, prenom: true, telephone: true , note:true},
    });

    res.status(201).json({ message: 'Compte créé avec succès' });    
});

app.post('/auth/login', valider(schemaConnexion), async (req, res) => {
    const { email, motDePasseClaire } = req.body;

    const user = await prisma.comptes.findFirst({ where: { email } });
    if (!user || !(await bcrypt.compare(motDePasseClaire, user.motDePasseClaire))) {
        return res.status(401).json({ error: 'Identifiants invalides' });
    };

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, hotelId: user.hotelId }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({ token });
});

app.post('/auth/logout', authentification, (req, res) => {  //// mettre dle token généré pendant la connexion dans le header (sur postman) pour pouvoir se déconnecter
    res.status(204).json({ message: 'Déconnexion réussie' });
});

////////////////////////////////////////////// PORT ////////////////////////////////////////////////////////////////////////////////////////

app.listen(3000, () => console.log(`API écoute sur http://localhost:3000`));