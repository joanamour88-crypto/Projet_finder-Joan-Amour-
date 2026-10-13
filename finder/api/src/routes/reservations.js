import { Router } from 'express';
import prisma from '../prisma.js';
import { authentification, exigeRole, validerBody } from '../middlewares.js';
import {schemaReservation } from '../schemas.js';

const router = Router();

////////////////////////////////////////////// Reservations  ////////////////////////////////////////////////////////////////////////////////////////

//-↓- Get -↓-//

/**
* @openapi
* /reservations/mine:
*   get:
*       summary: Récupérer les réservations du voyageur connecté
*       tags: [Reservations]
*       security: [{ bearerAuth: [] }]
*       responses:
*           200: { description: Le livre modifie }
*           401: { description: Jeton absent ou invalide }
*           403: { description: Ce livre ne vous appartient pas }
*           404: { description: Aucun livre avec cet identifiant }
* */

router.get('/mine', authentification, async (req, res) => {
    try{
        const reservations = await prisma.reservations.findMany({
            where: { voyageurId: req.user.id }
        });
        res.json(reservations)
    }
    catch (e) {
        res.status(400).json({ erreur: e.message })
    }
});

/**
* @openapi
* /reservations/received:
*   get:
*       summary: Récupérer les réservations reçues par un hotelier
*       tags: [Reservations]
*       security: [{ bearerAuth: [] }]
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

router.get('/received', authentification, exigeRole('hotelier'), async (req,res) => {
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

router.post('/', authentification, exigeRole('voyageur'), validerBody(schemaReservation), async (req, res) => {
    try {
        const {chambreId, dateArrivee, dateDepart, nbPersonnes, demandeSpeciale} = req.body;
        
        if(new Date(dateArrivee) >= new Date(dateDepart)){
            return res.status(400).json({ error: 'La date d\'arrivée ne peut pas être après la date de départ' });
        }else{
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
        
    }
    catch (e) {
        res.status(400).json({ erreur: e.message })
    }
});

//-- Patch --//

/**
* @openapi
* /reservations/{id}:
*   patch:
*       summary: Modifier une réservation existante
*       tags: [Reservations]
*       security: [{ bearerAuth: [] }]
*       parameters:
*         - name: id
*           in: path
*           required: true
*           schema:
*               type: integer
*       requestBody:
*           required: true
*           content:
*              application/json:
*                 schema:
*                    type: object
*                    required: [ chambreId, dateArrivee, dateDepart, nbPersonnes ]
*                    properties: { chambreId: { type : Number}, dateArrivee: { type : String, format: date}, dateDepart: { type : String, format: date}, nbPersonnes: { type : Number}, demandeSpeciale: { type : String} }
*       responses:
*           200: { description: La réservation a été modifiée }
*           401: { description: Jeton absent ou invalide }
*           403: { description: Cette réservation ne vous appartient pas }
*           404: { description: Aucune réservation avec cet identifiant }
* */

router.patch('/:id', authentification, exigeRole('hotelier'), async (req, res)=>{
    try{
        //const id = parseInt(req.params.id);
        const { dateArrivee, dateDepart, nbPersonnes, statut, demandeSpecial } = req.body;

        const reservations = await prisma.reservations.findUnique({ 
            where: { id : Number(req.params.id) },
            include: { chambre: true },
        });
        if (!reservations) {
            return res.status(404).json({ error: 'Réservation introuvable' });
        }
        if (reservations.voyageurId !== req.user.id) {
            return res.status(403).json({ error: 'Interdiction/Acces refuser' });
        }
        if (!transitionValide(reservations.statut, req.body.statut)) {
            return res.status(402).json({ error: `Passage de ${reservations.statut} à ${req.body.statut} interdit` });
        }

        const updated = await prisma.reservations.update({
            where: { id : Number(req.params.id) },
            data: { 
                dateArrivee: new Date(dateArrivee),
                dateDepart: new Date(dateDepart),
                nbPersonnes,
                statut,
                demandeSpeciale: demandeSpecial || null
            },
        });

        res.status(200).json(updated);
    }
    catch (e) {
        res.status(404).json({ erreur: e.message })
    }
});

//-- Delete --//

/**
* @openapi
* /reservations/{id}:
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

router.delete('/:id', authentification, exigeRole('voyageur'), async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ error: 'id invalide' });
        }

        const reservation = await prisma.reservations.findUnique({ where: { id } });
        if (!reservation) {
            return res.status(404).json({ error: 'Réservation non trouvée' });
        }
        if (reservation.voyageurId !== req.user.id) {
            return res.status(403).json({ error: 'Accès refusé, ce n\'est pas votre réservation' });
        }
        if (!transitionValide(reservation.statut, 'annulee')) {
            return res.status(409).json({ error: `Passage de ${reservation.statut} à annulee interdit` });
        }

        await prisma.reservations.update({ where: { id }, data: { statut: 'annulee' } });
        res.status(204).send();
    } catch (e) {
        console.error(e);
        res.status(500).json({ erreur: e.message });
    }
});
export default router;