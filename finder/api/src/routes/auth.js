import { Router } from 'express';
import prisma from '../prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { validerBody, authentification } from '../middlewares.js';
import { schemaInscription, schemaConnexion} from '../schemas.js';

const router = Router();

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

router.post('/register', validerBody(schemaInscription), async (req, res) => {
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

router.post('/login', validerBody(schemaConnexion), async (req, res) => {
    try {
        const { email, motDePasseClaire } = req.body;

        const user = await prisma.comptes.findUnique({ where: { email } });
        if (!user || !(await bcrypt.compare(motDePasseClaire, user.motDePasseClaire))) {
            return res.status(401).json({ error: 'Identifiants invalides' });
        };

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role, hotelId: user.hotelId }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(200).json({message: 'Connection réussie', token });
    } catch (erreur) {
        console.error('========== ERREUR LOGIN ==========');
        console.error('Type :', erreur.name);
        console.error('Message :', erreur.message);
        console.error('Pile complète :', erreur.stack);
        console.error('==================================');

        return res.status(500).json({
            error: erreur.message
        });
    }
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

router.post('/logout', authentification, (req, res) => {  //// mettre le token généré pendant la connexion dans le header (sur postman) pour pouvoir se déconnecter
    res.status(200).json({ message: 'Déconnexion réussie' });
});

export default router;