import { Router } from 'express';
import prisma from '../prisma.js'; 
import { authentification, exigeRole, validerBody, validerQuery } from '../middlewares.js';
import { schemaModifChambre, schemaCreateChambre, schemaGetChambre } from '../schemas.js';
import { tr } from 'zod/v4/locales';

const router = Router();

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

router.get('/', validerQuery(schemaGetChambre), async (req, res) => {
    try {
        const { hotel, date_debut, date_fin, capacite, prix_max, categorie } = req.validatedQuery;
        const filtre = {};
        if (hotel) filtre.hotelId = Number(hotel);
        if (capacite) filtre.capacite = Number(capacite); //gte = greater than or equal to
        if (prix_max) filtre.prixNuit = { lte: Number(prix_max) }; //lte = less than or equal to
        if (categorie) filtre.categorie = categorie;

        ///// Permet d'envoyer une erreur 400 si prix_max n'est pas un nombre ou est vide ///////////////////////////////////////////////
        ///// Generer par claude(Sonnet 5.5)
        ///// 'typeof' -> permet de vérifier le type de la variable 'prix_max' pour s'assurer qu'il s'agit d'une chaîne de caractères. donc que se soit un Int, un float ou un string
        ///// 'trim()' -> permet de supprimer les espaces vides au début et à la fin de la chaîne de caractères. donc si l'utilisateur envoie un string vide, il sera considéré comme invalide
        ///// 'Number.isFinite()' -> permet de vérifier si la valeur convertie en nombre est un nombre fini. donc si l'utilisateur envoie un string qui ne peut pas être converti en nombre, il sera considéré comme invalide
        ///// ↓ ///// → marche pas ←
        /*if (prix_max !== undefined) {
            filtre.prixNuit = { lte: Number(prix_max) }; //lte = less than or equal to
        }else {
            const prixMax = Number(prix_max);

            if (typeof prix_max !== 'string' || prix_max.trim() === '' || !Number.isFinite(prixMax)) {
                return res.status(400).json({ error: "Erreur sur le prix : prix_max doit être un nombre" });
            }
        }*/
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

        res.status(200).json(await prisma.chambres.findMany({ where: filtre }));

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
*           200: { description: La chambre a été créée }
*           401: { description: Jeton absent ou invalide }
*           403: { description: Cette chambre ne vous appartient pas }
*           404: { description: Chambre introuvable }
* */

router.post('/', authentification, exigeRole('hotelier'), validerBody(schemaCreateChambre), async (req, res) => {

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
* /chambres/{id}:
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
*           200: { description: La chambre a été modifiée }
*           401: { description: Jeton absent ou invalide }
*           403: { description: Cette chambre ne vous appartient pas }
*           404: { description: Chambre introuvable }
* */

router.patch('/:id', authentification, exigeRole('hotelier'), validerBody(schemaModifChambre),  async (req, res) => {
    try {
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
    }
    catch (e) {
        res.status(500).json({ error: "Erreur lors de la mise à jour de la chambre" });
    }
});

//-- Delete --//

/**
* @openapi
* /chambres/{id}:
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

router.delete('/:id', authentification, exigeRole('hotelier'), async (req, res) => {
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
export default router;