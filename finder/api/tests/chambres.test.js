import {describe, it, epect} from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('GET /chambres', () => {
    it('should return a list of chambres', async () => {
        const response = await request(app).get('/chambres');
        console.log(response.status, response.body);
        expect(response.status).toBe(200);
    });
});