import { Router } from 'express';
import prisma from '../prisma.js';

const router = Router();

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

router.get('/', async (req, res) => {
    try {
        const hotels = await prisma.hotels.findMany({
            orderBy: { id: 'asc' }
        });
        res.json(hotels);
    } 
    catch (error) {
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

router.get('/:id',async (req, res) => {
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
router.get ('/:id/chambres', async (req, res) => {
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
export default router;