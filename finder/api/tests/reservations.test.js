import { describe, it, expect, vi, afterEach } from 'vitest'; 
import request from 'supertest'; 
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import app from '../src/app.js'; 
import prisma from '../src/prisma.js';

let tokenVoyageur;
let tokenHotelier;

beforeAll(() => {
    process.env.JWT_SECRET = 'secret_de_test';
    tokenVoyageur = jwt.sign({ id: 5, role: 'voyageur' }, process.env.JWT_SECRET);
    tokenHotelier = jwt.sign({ id: 1, role: 'hotelier', hotelId: 1 }, process.env.JWT_SECRET);
});
afterAll(async () => {
    await prisma.$disconnect();
});

describe('Reservations API', () => {
    it('get /reservations/mine', async() =>{
        const res = await request(app)
            .get('/reservations/mine') 
            .set('Authorization', `Bearer ${tokenVoyageur}`)
        //console.log('Statut HTTP :', chambresFiltrees.status);
        //console.log('Corps de la réponse :', chambresFiltrees.body);
        //console.log('Texte brut :', chambresFiltrees.text);
        expect(res.status).toBe(200);
    });

    it('GET /reservations/received' , async() => {
        const res = await request(app)
            .get('/reservations/received')
            .set('Authorization', `Bearer ${tokenHotelier}`)
        expect(res.status).toBe(200);
    })

    it('doit renvoyer 404 si la réservation existe pas', async () => {
        vi.spyOn(prisma.reservations, 'findUnique').mockResolvedValue(null);
        const res = await request(app)
            .patch('/reservations/999999')
            .set('Authorization', `Bearer ${tokenHotelier}`)
            .send({ statut: 'confirmee' });
        
        expect(res.status).toBe(404);
        vi.restoreAllMocks();
    });
});