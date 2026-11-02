import { describe, it, expect, vi, afterEach } from 'vitest'; 
import request from 'supertest'; 
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import app from '../src/app.js'; 
import prisma from '../src/prisma.js';

describe('Get /hotels', () => {
    it('Retourne la liste des hôtels', async () => {
        const tousleshôtels = await request(app).get('/hotels');
        console.log('Statut HTTP :', tousleshôtels.status);
        console.log('Corps de la réponse :', tousleshôtels.count);
        console.log('Texte brut :', tousleshôtels.text);
        expect(tousleshôtels.status).toBe(200);
    });
});