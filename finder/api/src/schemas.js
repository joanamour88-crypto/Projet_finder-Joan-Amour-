import { z } from 'zod';

export const schemaInscription = z.object({
    email: z.string().email('email invalide'),
    motDePasseClaire: z.string().min(8, 'mot de passe : 8 caractères minimum'),
    nom: z.string(),
    prenom: z.string(),
    telephone: z.string().optional(),
    note: z.number().optional(),
});

export const schemaConnexion = z.object({
    email: z.string().email('email invalide'),
    motDePasseClaire: z.string().min(8, 'mot de passe obligatoire'),
});

export const schemaModifCompte = schemaInscription.partial();

//////////////////// Chambres ////////////////////

export const schemaCreateChambre = z.object({
    hotelId: z.number().int().positive(),
    numero: z.string(),
    categorie: z.string(),
    capacite: z.number().int().positive(),
    prixNuit: z.number().int().positive(),
    description: z.string().optional(),
});

export const schemaGetChambre = z.object({
    hotelId: z.number().int().positive().optional(),
    categorie: z.enum(['double', 'familiale', 'suite', 'simple']).optional(),
    capacite: z.coerce.number().int().positive().optional(),
    prixNuit: z.coerce.number().int().positive().optional(),
    description: z.string().optional(),
    disponible: z.boolean().optional()
});

export const schemaModifChambre = schemaCreateChambre.partial();

//////////////////// Reservations ////////////////////

export const schemaReservation = z.object({
    chambreId: z.number().int().positive(),
    dateArrivee: z.coerce.date(),
    dateDepart: z.coerce.date(),
    nbPersonnes: z.number().int().positive(),
    demandeSpeciale: z.string().optional()
});

const schemaProfil = z.object({
    nom: z.string().min(1, 'nom obligatoire').max(100),
    bio: z.string().max(500),
    ville: z.string().min(1),
});

//////////////////// Profil ////////////////////

export const schemaModifProfil = schemaProfil
  .partial()
  .refine((corps) => Object.keys(corps).length > 0, {
    message: 'au moins un champ à modifier',
  });