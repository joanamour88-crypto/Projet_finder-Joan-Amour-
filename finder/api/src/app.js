import express from 'express';
import 'dotenv/config'; /// normalement utiliser par server.js mais je l'ai mis ici pour que le test vitest fonctionne
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
//import { PrismaClient } from '../src/generated/prisma/client.ts';
import { schemaInscription, schemaConnexion, schemaModifCompte, schemaCreateChambre, schemaGetChambre, schemaModifChambre, schemaReservation } from '../src/schemas.js';


import chambresRoutes from './routes/chambres.js';
import hotelsRoutes from './routes/hotels.js';
import reservationsRoutes from './routes/reservations.js';
import authRoutes from './routes/auth.js';
import voyageursRoutes from './routes/voyageur.js';

const app = express();
app.use(express.json());

app.use('/chambres', chambresRoutes);
app.use('/hotels', hotelsRoutes);
app.use('/reservations', reservationsRoutes);
app.use('/auth', authRoutes);
app.use('/voyageurs', voyageursRoutes);

const spec = swaggerJsdoc({
definition: {
openapi: '3.0.0',
info: { title: 'API', version: '1.0.0' },
components: { securitySchemes: { bearerAuth: { type: 'http', scheme:'bearer', bearerFormat: 'JWT' } } },
},
apis: ['./src/**/*.js'],
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(spec));


app.get('/', (req, res) => {
    res.json({ message: 'API en ligne' });
});


////////////////////////////////////////////// Fonction d'autorisation de transition /////////////////////////////////////////////////////////////////

const TRANSITIONS_AUTORISEES = {
    en_attente: ["confirmee", "annulee", "refusee"],
    confirmee: ["annulee"],
    annulee: ["en_attente"],
    refusee: [],
};

function transitionValide(statutActuel, statutVoulu) {
    return (TRANSITIONS_AUTORISEES[statutActuel] || []).includes(statutVoulu);
};

export default app;