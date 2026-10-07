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
////////////////////////////////////////////// Fonction d'autorisation de transition /////////////////////////////////////////////////////////////////

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

//-↓- Get -↓-//

/**
 * @openapi
 * /chambres:
 *   get:
 *     summary: Récupérer les chambres disponibles
 *     tags: [Chambres]
 *     parameters:
 *       - in: query
 *         name: date_debut
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début du séjour (AAAA-MM-JJ)
 *       - in: query
 *         name: date_fin
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin du séjour (AAAA-MM-JJ)
 *       - in: query
 *         name: capacite
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Nombre de personnes minimum
 *       - in: query
 *         name: prix_max
 *         required: false
 *         schema:
 *           type: number
 *         description: Prix maximum par nuit
 *     responses:
 *       200:
 *         description: Liste des chambres disponibles
 *       400:
 *         description: Paramètres invalides
 *       401:
 *         description: Jeton absent ou invalide
 *       404:
 *         description: Aucune chambre disponible
 */

app.get('/chambres', /*valider(schemaGetChambre),*/ async (req, res) => {
    try {
        const { hotel, date_debut, date_fin, capacite, prix_max, categorie } = req.query;
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

        if (date_debut && date_fin && date_debut < date_fin) {
            filtre.reservation = {
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

/**
* @openapi
* /chambres:
*   post:
*       summary: Créer une chambre 
*       tags: [Chambres]
*       security: [{ bearerAuth: [] }]
*       requestBody:
*           required: true
*           content:
*               application/json:
*                   schema:
*                      type: object
*                      required: [ numero, categorie, capacite, prixNuit, description, disponible ]
*                      properties: { numero: { type : String}, categorie: { type : String}, capacite: { type : Number}, prixNuit: { type : Number}, description: { type : String}, disponible: { type : Boolean} }
*       responses:
*           200: { description: Le livre modifie }
*           401: { description: Jeton absent ou invalide }
*           403: { description: Ce livre ne vous appartient pas }
*           404: { description: Aucun livre avec cet identifiant }
* */

app.post('/chambres', authentification, /*valider(schemaChambre),*/ exigeRole('hotelier'), async (req, res) => {

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

/**
* @openapi
* /chambres:
*   patch:
*       summary: Mettre à jour une chambre
*       tags: [Chambres]
*       security: [{ bearerAuth: [] }]
*       parameters:
*           - name: id
*             in: path
*             required: true
*             schema:
*                 type: integer
*       requestBody:
*           required: true
*           content:
*               application/json:
*                   schema:
*                      type: object
*                      required: [ numero, categorie, capacite, prixNuit, description, disponible ]
*                      properties: { numero: { type : String}, categorie: { type : String}, capacite: { type : Number}, prixNuit: { type : Number}, description: { type : String}, disponible: { type : Boolean} }
*       responses:
*           200: { description: Le livre modifie }
*           401: { description: Jeton absent ou invalide }
*           403: { description: Ce livre ne vous appartient pas }
*           404: { description: Aucun livre avec cet identifiant }
* */

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

/**
* @openapi
* /chambres:
*   delete:
*       summary: Supprimer une chambre
*       tags: [Chambres]
*       security: [{ bearerAuth: [] }]
*       parameters:
*           - name: id
*             in: path
*             required: true
*             schema:
*                 type: integer
*       responses:
*           204: { description: Chambre supprimée }
*           401: { description: Jeton absent ou invalide }
*           403: { description: Accès refusé }
*           404: { description: Chambre non trouvée }
* */

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

//-↓- Get -↓-//

/**
* @openapi
* /hotels:
*   get:
*       summary: Récupérer les hôtels
*       tags: [Hotels]
*       responses:
*           200: { description: Liste des hôtels }
*           401: { description: Jeton absent ou invalide }
*           403: { description: Accès refusé }
*           404: { description: Aucun hotel avec cet identifiant }
* */

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

/**
* @openapi
* /hotels/{id}:
*   get:
*       summary: Récupérer les hotels disponibles par rapport a un numéro
*       tags: [Hotels]
*       parameters:
*         - in: path
*           name: id
*           required: true
*           schema: { type: integer }
*       responses:
*           200: { description: Le livre modifie }
*           401: { description: Jeton absent ou invalide }
*           403: { description: Ce livre ne vous appartient pas }
*           404: { description: Aucun livre avec cet identifiant }
* */

app.get('/hotels/:id',async (req, res) => {
    const id = Number(req.params.id);
    const hotel = await prisma.hotels.findUnique({ where: { id } });
    if (!hotel) { 
        return res.status(404).json({ error: 'Hôtel non trouvé' });
    }
    res.json(hotel);
});

/**
* @openapi
* /hotels/{id}/chambres:
*   get:
*       summary: Récupérer les chambres disponibles par rapport a un numéro et une chambre
*       tags: [Hotels]
*       parameters:
*         - in: path
*           name: id
*           required: true
*           schema: { type: integer }
*       responses:
*           200: { description: Le livre modifie }
*           401: { description: Jeton absent ou invalide }
*           403: { description: Ce livre ne vous appartient pas }
*           404: { description: Aucun livre avec cet identifiant }
* */
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

//-↓- Get -↓-//

/**
* @openapi
* /comptes:
*   get:
*       summary: Récupérer les comptes disponibles
*       tags: [Comptes]
*       parameters:
*         - in: path
*           name: id
*           required: true
*           schema: { type: integer }
*       responses:
*           200: { description: Le livre modifie }
*           401: { description: Jeton absent ou invalide }
*           403: { description: Ce livre ne vous appartient pas }
*           404: { description: Aucun livre avec cet identifiant }
* */

app.get('/comptes/:id', async (req, res) => {
    const id = Number(req.params.id);
    const compte = await prisma.comptes.findUnique({ where: { id } });
    if (!compte) { 
        return res.status(404).json({ error: 'Compte non trouvé' });
    }
    res.json(compte);
});

////////////////////////////////////////////// Reservations  ////////////////////////////////////////////////////////////////////////////////////////

//-↓- Get -↓-//

/**
* @openapi
* /reservations/mine:
*   get:
*       summary: Récupérer les réservations du voyageur connecté
*       tags: [Reservations]
*       responses:
*           200: { description: Le livre modifie }
*           401: { description: Jeton absent ou invalide }
*           403: { description: Ce livre ne vous appartient pas }
*           404: { description: Aucun livre avec cet identifiant }
* */

app.get('/reservations/mine', authentification, async (req, res) => {
    try{
        const reservations = await prisma.reservations.findMany({
            where: { voyageurId: req.user.id }
        });
        res.json(reservations)
    }
    catch (e) {
        res.status(400).json({ erreur: e.message })
    }
})

/**
* @openapi
* /reservations/received:
*   get:
*       summary: Récupérer les réservations reçues par un hotelier
*       tags: [Reservations]
*       parameters:
*         - in: path
*           name: id
*           required: true
*           schema: { type: integer }
*       responses:
*           200: { description: Le livre modifie }
*           401: { description: Jeton absent ou invalide }
*           403: { description: Ce livre ne vous appartient pas }
*           404: { description: Aucun livre avec cet identifiant }
* */

app.get('/reservations/received', authentification, exigeRole('hotelier'), async (req,res) => {
    try {
        const reservations = await prisma.reservations.findMany({
            where: { chambre: { hotelId: req.user.hotelId } },
            orderBy: { chambreId: 'asc' }
        });
        res.json(reservations)
    }
    catch (e) {
        res.status(404).json({ erreur: e.message })
    }
})

/**
* @openapi
* /reservations/:id:
*   get:
*       summary: Récupérer les réservations par rapport a un numéro
*       tags: [Reservations]
*       parameters:
*         - in: path
*           name: id
*           required: true
*           schema: { type: integer }
*       responses:
*           200: { description: Le livre modifie }
*           401: { description: Jeton absent ou invalide }
*           403: { description: Ce livre ne vous appartient pas }
*           404: { description: Aucun livre avec cet identifiant }
* */

app.get('/reservations/:id', valider(schemaReservation), async (req, res) => {
    const id = Number(req.params.id);
    const reservation = await prisma.reservations.findUnique({ where: { id } });
    if (!reservation) { 
        return res.status(404).json({ error: 'Réservation non trouvée' });
    }
    res.json(reservation);
});

//-- Post --//

/**
* @openapi
* /reservation:
*   post:
*       summary: Créer une nouvelle réservation
*       tags: [Reservations]
*       security: [{ bearerAuth: [] }]
*       requestBody:
*          required: true
*          content:
*             application/json:
*                schema:
*                    type: object
*                    required: [ chambreId, dateArrivee, dateDepart, nbPersonnes ]
*                    properties: { chambreId: { type : Number}, dateArrivee: { type : String, format: date}, dateDepart: { type : String, format: date}, nbPersonnes: { type : Number}, demandeSpeciale: { type : String} }
*       responses:
*           200: { description: Le livre modifie }
*           401: { description: Jeton absent ou invalide }
*           403: { description: Ce livre ne vous appartient pas }
*           404: { description: Aucun livre avec cet identifiant }
* */

app.post('/reservation', authentification, valider(schemaReservation), async (req, res) => {
    try {
        const {chambreId, dateArrivee, dateDepart, nbPersonnes, demandeSpeciale} = req.body;

        const newReservation = await prisma.reservations.create({
            data: {
                voyageurId: req.user.id,
                chambreId,
                dateArrivee: new Date(dateArrivee),
                dateDepart: new Date(dateDepart),
                nbPersonnes,
                statut: "en_attente",
                demandeSpeciale: demandeSpeciale
            }
        });
        res.status(201).json(newReservation);
    }
    catch (e) {
        res.status(400).json({ erreur: e.message })
    }
})

//-- Patch --//

/**
* @openapi
* /reservation/:id:
*   patch:
*       summary: Mettre à jour une réservation existante
*       tags: [Reservations]
*       security: [{ bearerAuth: [] }]
*       requestBody:
*           required: true
*           content:
*              application/json:
*                 schema:
*                    type: object
*                    required: [ chambreId, dateArrivee, dateDepart, nbPersonnes ]
*                    properties: { chambreId: { type : Number}, dateArrivee: { type : String, format: date}, dateDepart: { type : String, format: date}, nbPersonnes: { type : Number}, demandeSpeciale: { type : String} }
*       responses:
*           200: { description: Le livre modifie }
*           401: { description: Jeton absent ou invalide }
*           403: { description: Ce livre ne vous appartient pas }
*           404: { description: Aucun livre avec cet identifiant }
* */

app.patch('/reservations/:id', exigeRole('hotelier'), async (req, res)=>{
    const id = parseInt(req.params.id);
    const { dateArrivee, dateDepart, nbPersonnes, statut, demandeSpecial } = req.body;

    const reservations = await prisma.reservations.findUnique({ where: { id } });
    if (!reservations) {
        return res.status(404).json({ error: 'Réservation introuvable' });
    }
    if (transitionValide(reservations.statut, 'confirmee')) {
        return res.status(200).json({ error: 'Accès refusé' });
    }

    const updated = await prisma.reservations.update({
        where: { id },
        data: { dateArrivee, dateDepart, nbPersonnes, statut, demandeSpecial: demandeSpecial || null },
    });

    res.json(updated);
})

//-- Delete --//

/**
* @openapi
* /reservations/:id:
*   delete:
*       summary: Supprimer une réservation
*       tags: [Reservations]
*       security: [{ bearerAuth: [] }]
*       parameters:
*           - name: id
*             in: path
*             required: true
*             schema:
*                 type: integer
*       responses:
*           204: { description: Réservation supprimée }
*           401: { description: Jeton absent ou invalide }
*           403: { description: Accès refusé }
*           404: { description: Réservation non trouvée }
* */

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

//-↓- Get -↓-//

/**
* @openapi
* /voyageur/me:
*   get:
*       summary: Récupérer les informations du voyageur
*       tags: [Voyageurs]
*       security: [{ bearerAuth: [] }]
*       responses:
*           200: { description: Informations du voyageur }
*           401: { description: Jeton absent ou invalide }
*           404: { description: Voyageur non trouvé }
* */

app.get('/voyageur/me', authentification, exigeRole('voyageur'), async (req, res) => {
    const voyageur = await prisma.comptes.findUnique({ where: { id: req.user.id } });
    if (!voyageur) {
        return res.status(404).json({ error: 'Voyageur non trouvé' });
    }
    res.json({ nom: voyageur.nom, prenom: voyageur.prenom, telephone: voyageur.telephone });
});

//-- Patch --//

/**
* @openapi
* /voyageur/me:
*   patch:
*       summary: Mettre à jour les informations du voyageur
*       tags: [Voyageurs]
*       security: [{ bearerAuth: [] }]
*       requestBody:
*           required: true
*           content:
*              application/json:
*                 schema:
*                    type: object
*                    required: [ nom, prenom, telephone ]
*                    properties: { nom: { type : String}, prenom: { type : String}, telephone: { type : String} }
*       responses:
*           200: { description: Les informations du voyageur ont été mises à jour }
*           401: { description: Jeton absent ou invalide }
*           403: { description: Ces informations ne vous appartiennent pas }
*           404: { description: Voyageur non trouvé }
* */

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

/**
* @openapi
* /auth/register:
*   post:
*       summary: Créer une nouvelle réservation
*       tags: [Connexion]
*       requestBody:
*          required: true
*          content:
*             application/json:
*                schema:
*                    type: object
*                    required: [ email, motDePasseClaire, nom, prenom, telephone, note ]
*                    properties: { email: { type : String}, motDePasseClaire: { type : String}, nom: { type : String}, prenom: { type : String}, telephone: { type : String}, note: { type : String} }
*       responses:
*           200: { description: Compte créé avec succès }
*           401: { description: Jeton absent ou invalide }
*           403: { description: Accès refusé }
*           404: { description: Aucun livre avec cet identifiant }
* */

app.post('/auth/register', valider(schemaInscription), async (req, res) => {
    const {email, motDePasseClaire, nom, prenom, telephone, note } = req.body;
    const hashMDP = await bcrypt.hash(motDePasseClaire, 10);
    await prisma.comptes.create({
        data: {email, motDePasseClaire: hashMDP,note, nom, prenom, telephone, role: "voyageur"},
        select: { id: true, email: true, nom: true, prenom: true, telephone: true , note:true},
    });

    res.status(201).json({ message: 'Compte créé avec succès' });    
});

/**
* @openapi
* /auth/login:
*   post:
*       summary: Se connecter au système
*       tags: [Connexion]
*       requestBody:
*          required: true
*          content:
*             application/json:
*                schema:
*                    type: object
*                    required: [ email, motDePasseClaire ]
*                    properties: { email: { type : String}, motDePasseClaire: { type : String} }
*       responses:
*           200: { description: Connexion réussie }
*           401: { description: Jeton absent ou invalide }
*           403: { description: Accès refusé }
*           404: { description: Aucun livre avec cet identifiant }
* */

app.post('/auth/login', valider(schemaConnexion), async (req, res) => {
    const { email, motDePasseClaire } = req.body;

    const user = await prisma.comptes.findFirst({ where: { email } });
    if (!user || !(await bcrypt.compare(motDePasseClaire, user.motDePasseClaire))) {
        return res.status(401).json({ error: 'Identifiants invalides' });
    };

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, hotelId: user.hotelId }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({ token });
});

/**
* @openapi
* /auth/logout:
*   post:
*       summary: Se déconnecter du système
*       tags: [Connexion]
*       security: [{ bearerAuth: [] }]
*       responses:
*           200: { description: Compte créé avec succès }
*           204: { description: Déconnexion réussie }
*           401: { description: Jeton absent ou invalide }
*           403: { description: Accès refusé }
*           404: { description: Aucun livre avec cet identifiant }
* */

app.post('/auth/logout', authentification, (req, res) => {  //// mettre le token généré pendant la connexion dans le header (sur postman) pour pouvoir se déconnecter
    res.status(204).json({ message: 'Déconnexion réussie' });
});

////////////////////////////////////////////// PORT ////////////////////////////////////////////////////////////////////////////////////////

app.listen(3000, () => console.log(`API écoute sur http://localhost:3000`));