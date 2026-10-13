import { describe, it, expect, vi, afterEach } from 'vitest'; 
import request from 'supertest'; 
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import app from '../src/app.js'; 
import prisma from '../src/prisma.js';

describe('Get /chambres', () => {
    it('Retourne la liste des chambres', async () => {
        const touteleschambres = await request(app).get('/chambres');
        //console.log('Statut HTTP :', touteleschambres.status);
        //console.log('Corps de la réponse :', touteleschambres.body);
        //console.log('Texte brut :', touteleschambres.text);
        expect(touteleschambres.status).toBe(200);
    });

    it('Retourne la liste des chambres filtrées par hotel', async () => {
        const hotel = 1;
        const chambresFiltrees = await request(app).get(`/chambres?hotel=${hotel}`);
        //console.log('Statut HTTP :', chambresFiltrees.status);
        //console.log('Corps de la réponse :', chambresFiltrees.body);
        //console.log('Texte brut :', chambresFiltrees.text);
        expect(chambresFiltrees.status).toBe(200);
    });

    it('Retourne la liste des chambres filtrées par capacite', async () => {
        const capacite = 2;
        const chambresFiltrees = await request(app).get(`/chambres?capacite=${capacite}`);
        //console.log('Statut HTTP :', chambresFiltrees.status);
        //console.log('Corps de la réponse :', chambresFiltrees.body);
        //console.log('Texte brut :', chambresFiltrees.text);
        expect(chambresFiltrees.status).toBe(200);
    });

    it('Retourne la liste des chambres filtrées par prix_max', async () => {
        const prix_max = 70;
        const chambresFiltrees = await request(app).get(`/chambres?prix_max=${prix_max}`);
        //console.log('Statut HTTP :', chambresFiltrees.status);
        //console.log('Corps de la réponse :', chambresFiltrees.body);
        //console.log('Texte brut :', chambresFiltrees.text);
        expect(chambresFiltrees.status).toBe(200);
    });

    it('Retourne la liste des chambres filtrées par categorie', async () => {
        const categorie = 'double';
        const chambresFiltrees = await request(app).get(`/chambres?categorie=${categorie}`);
        //console.log('Statut HTTP :', chambresFiltrees.status);
        //console.log('Corps de la réponse :', chambresFiltrees.body);
        //console.log('Texte brut :', chambresFiltrees.text);
        expect(chambresFiltrees.status).toBe(200);
    });

    it('renvoie 400 si un filtre est invalide', async () => {
        const reponse = await request(app).get('/chambres?prix_max=invalid');
        //console.log('Statut HTTP :', reponse.status);
        //console.log('Corps de la réponse :', reponse.body);
        //console.log('Texte brut :', reponse.text);
        expect(reponse.status).toBe(400);
    });

    describe('POST /chambres', () => {
        afterEach(() => {
            vi.restoreAllMocks();
        });
        it('POST /chambres renvoie 201 si la chambre est créée', async () => {
            process.env.JWT_SECRET = 'secret_de_test';
            const fauxToken = jwt.sign({ id: 99, role: 'hotelier', hotelId: 2 }, process.env.JWT_SECRET);

            const nouvChambre = {
            hotelId: 2,                        
            numero: "808",                             
            categorie: "simple",                       
            capacite: 2,                                
            prixNuit: 34,                               
            description: "une télé 4K full hd 75 pouces", 
            disponible: true                               
            };

            const creerSpy = vi.spyOn(prisma.chambres, 'create').mockResolvedValue({
            id: 74,
            ...nouvChambre
            });

            const res = await request(app)
            .post('/chambres')
            .set('Authorization', `Bearer ${fauxToken}`)
            .send(nouvChambre);

            expect(res.status).toBe(201);
            expect(creerSpy).toHaveBeenCalled();
        });
    })

    describe('PATCH /chambres/:id', () => {
        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('PATCH /chambres/:id renvoie 403 si la chambre appartient à un autre hôtel', async () => {
            process.env.JWT_SECRET = 'secret_de_test';
            const fauxToken = jwt.sign({ id: 99, role: 'hotelier', hotelId: 42 }, process.env.JWT_SECRET);

            vi.spyOn(prisma.chambres, 'findUnique').mockResolvedValue({
            id: 10,
            hotelId: 7 // différent du hotelId du token (42)
            });
            const updateSpy = vi.spyOn(prisma.chambres, 'update');

            const res = await request(app)
            .patch('/chambres/10')
            .set('Authorization', `Bearer ${fauxToken}`)
            .send({ prixNuit: 120 });

            expect(res.status).toBe(403);
            expect(updateSpy).not.toHaveBeenCalled();
        });
    });

    describe('DELETE /chambres/:id', () => {
        afterEach(() => {
            vi.restoreAllMocks(); // Nettoyage de nos espions Prisma
        });

        it('utiliser un mock pour DELETE sans toucher la BDD', async () => {
            process.env.JWT_SECRET = 'secret_de_test';

            const fauxToken = jwt.sign(
            { id: 99, role: 'hotelier', hotelId: 42 },
            // id 99 = id du compte de l'hotelier
            process.env.JWT_SECRET
            );
            //SpyOn = when de Java
            vi.spyOn(prisma.chambres, 'findUnique').mockResolvedValue({ 
            //id corespondant la chambre
            id: 10, 
            nom: 'Suite',
            hotelId: 42 // Correspond au token !
            });

            const deleteSpy = vi.spyOn(prisma.chambres, 'delete').mockResolvedValue({ 
            //pas hotelId car déjà récup en haut
            id: 10, 
            nom: 'Suite' 
            });
            const res = await request(app).delete('/chambres/10').set('Authorization', `Bearer ${fauxToken}`);

            expect(res.status).toBe(204);
            expect(deleteSpy).toHaveBeenCalledWith({ where: { id: 10 } });
        });
    });
});

