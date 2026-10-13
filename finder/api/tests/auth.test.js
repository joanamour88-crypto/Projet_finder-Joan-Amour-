import { describe, it, expect, vi, afterEach } from 'vitest'; 
import request from 'supertest'; 
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import app from '../src/app.js'; 
import prisma from '../src/prisma.js';


describe('Post /login', () => {
    it('Permet à un utilisateur existant de se connecter', async () => {

        vi.spyOn(prisma.comptes, 'findUnique').mockResolvedValue({
            id: 5,
            email: 'leJ@example.com',
            motDePasseClaire: await bcrypt.hash('password5555', 4), // hash du mot de passe envoyé
            role: 'voyageur',
            hotelId: null
        });

        const reponse = await request(app).post('/auth/login').send({
            email: 'leJ@example.com',
            motDePasseClaire: 'password5555'
        });

        console.log('Statut HTTP :', reponse.status);
        console.log('Corps de la réponse :', reponse.body);
        console.log('Texte brut :', reponse.text);

        expect(reponse.status).toBe(200);
        expect(reponse.body.token).toBeDefined();

        // Le token contient bien les infos du compte
        const contenu = jwt.verify(reponse.body.token, process.env.JWT_SECRET);
        expect(contenu.id).toBe(5);
        expect(contenu.role).toBe('voyageur');
    });
    
});