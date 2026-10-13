import jwt from 'jsonwebtoken';

////////////////////////////////////////////// Fonction valider par le schema /////////////////////////////////////////////////////////////////

export function validerBody(schema) {
    return (req, res, next) => {
        const resultat = schema.safeParse(req.body);
        if (!resultat.success) {
            return res.status(400).json({ erreurs : resultat.error.issues });
        }
        req.body = resultat.data;
        next();
    };
};

export function validerQuery(schema) {
    return (req, res, next) => {
        const resultat = schema.safeParse(req.query);
        if (!resultat.success) {
            return res.status(400).json({ erreurs : resultat.error.issues });
        }
        req.validatedQuery = resultat.data;
        next();
    };
};
////////////////////////////////////////////// Fonction d'authentification /////////////////////////////////////////////////////////////////

export function authentification(req, res, next) {
    const entete = req.headers.authorization || "";
    const token = entete.replace('Bearer ', ''); /// .replace() -> permet de remplacer 'Bearer ' par le token
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Token invalide' });
    }
};

////////////////////////////////////////////// Fonction qui exige un rôle /////////////////////////////////////////////////////////////////

export function exigeRole(...role){
    return (req, res, next) => {
        role.includes(req.user.role) ? next() : res.status(403).json({ error: 'Accès refusé' });
    }
};