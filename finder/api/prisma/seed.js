// prisma/seed.js
import { readFileSync } from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcrypt';
import { PrismaClient } from '../src/generated/prisma/client.ts';

const prisma = new PrismaClient();
const DATA_DIR = path.join(import.meta.dirname, '..', 'finder-data');
const lire = (fichier) => JSON.parse(readFileSync(path.join(DATA_DIR,
fichier), 'utf8'));

async function main() {
    const chambres = lire('chambres.json');
    const comptes = lire('comptes.json');
    const hotels = lire('hotels.json');
    const reservations = lire('reservations.json');

    await prisma.reservations.deleteMany();
    await prisma.comptes.deleteMany();
    await prisma.chambres.deleteMany();
    await prisma.hotels.deleteMany();
    

    await prisma.hotels.createMany({
        data: hotels.map((c) => ({
            id: c.id,
            nom: c.nom,
            etoiles: c.etoiles,
            adresse: c.adresse,
            codePostal: c.code_postal,
            ville: c.ville,
            telephone: c.telephone,
            email: c.email,
            gerant: c.gerant,
            description: c.description,
        })),
    });

    await prisma.chambres.createMany({
        data: chambres.map((c) => ({
            id: c.id,
            hotelId: c.hotel_id,
            numero: c.numero,
            categorie: c.categorie,
            capacite: c.capacite,
            prixNuit: c.prix_nuit,
            description: c.description,
            disponible: c.disponible,
        })),
    });

    const comptesHaches = await Promise.all(
        comptes.map(async (c) => ({
            id: c.id,
            role: c.role,
            email: c.email,
            motDePasseClaire: await bcrypt.hash(c.mot_de_passe_clair, 10),
            nom: c.nom,
            prenom: c.prenom,
            hotelId: c.hotel_id ?? null,
            telephone: c.telephone ?? null,
            note: c.note ?? null,
        })),
    );
    await prisma.comptes.createMany({ data: comptesHaches });

    await prisma.reservations.createMany({
        data: reservations.map((c) => ({
            id: c.id,
            voyageurId: c.voyageur_id,
            chambreId: c.chambre_id,
            dateArrivee: new Date(c.date_arrivee),
            dateDepart: new Date(c.date_depart),
            nbPersonnes: c.nb_personnes,
            statut: c.statut,
            demandeSpeciale: c.demande_speciale ?? null,
        })),
    });

    console.log('Données insérées avec succès !');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
