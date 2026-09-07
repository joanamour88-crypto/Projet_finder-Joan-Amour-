# docs/architecture.md  -- gabarit de départ, amendé à chaque étape 
# Architecture Finder - v1 du AAAA-MM-JJ (étape 1, en mémoire) 
  
## Vue d'ensemble 
curl / navigateur  --HTTP JSON-->  API Express (Node 24, port 3000)  -->  
tableaux en mémoire (hotels.json, chambres.json) 
                                                                      étape 
2 : Prisma --> MySQL local (Laragon), URL dans .env 
  
## Carte des fichiers 
finder/ 
  .gitignore           node_modules/ et .env 
  docs/                spec.md, architecture.md 
  api/ 
    package.json       scripts dev (nodemon) et start (node), tous deux sur 
src/server.js 
    .env               PORT, DATABASE_URL  (jamais commité) 
    finder-data/       le kit, copié tel quel, jamais modifié 
    src/server.js      charge le kit une fois, crée l'app, monte les routes, 
listen 
  
## Qui appelle qui 
1. npm run dev lance nodemon src/server.js ; dotenv charge .env dans 
process.env 
2. server.js lit les deux fichiers du kit UNE fois (readFileSync), puis crée 
l'app Express 
3. chaque route lit req.params.id, le convertit avec Number(), cherche dans 
le tableau avec find 
4. trouvé : res.json(objet) en 200 ; absent : res.status(404).json({ erreur 
}) avec return 
5. rien n'écrit dans les tableaux à l'étape 1 ; aucune authentification 
  
## Ce qui traverse quoi (chapitre API, « où arrive la donnée ») 
identifiant          -> dans le chemin            GET /chambres/12 
critères de recherche -> dans la query string      GET 
/chambres?hotel=1&capacite=2   (étape 3) 
ce qu'on crée/modifie -> dans le corps JSON        POST /chambres                    
(étape 4) 
  
## Choix et alternatives écartées 
Express        imposé par Sentinox ; léger, standard          écarté : 
NestJS, trop lourd 
mémoire d'abord fixer le contrat avant la base                écarté : 
Prisma dès la semaine 1 
CommonJS       la forme des chapitres API (require)           écarté : 
import, à revoir avec TypeScript