import { Router } from 'express';
import prisma from '../prisma.js';
import bcrypt from 'bcrypt';
import { authentification, exigeRole, validerBody } from '../middlewares.js';
import { schemaModifCompte } from '../schemas.js';

const router = Router();

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

router.get('/voyageur/me', authentification, exigeRole('voyageur'), async (req, res) => {
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

router.patch('/voyageur/me', authentification, exigeRole('voyageur'), validerBody(schemaModifCompte),  async (req, res) => {
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
export default router;