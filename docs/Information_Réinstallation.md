==============================================================
 FICHE DE REINSTALLATION - PROJET FINDER (Windows / Node.js)
==============================================================
 
Cette fiche explique, dans l'ordre, comment tout réinstaller
pour faire fonctionner le projet finder sur Windows.
 
 
--------------------------------------------------------------
 ETAPE 1 - Vérifier que Node.js et npm sont installés
--------------------------------------------------------------
Ouvre un terminal (PowerShell ou cmd) et tape :
 
    node -v
    npm.cmd -v
 
- Si des numéros de version s'affichent : Node.js est bien installé,
  passe à l'étape 2.
- Si "commande introuvable" : télécharge et installe la version LTS
  sur https://nodejs.org puis ferme et rouvre ton terminal.
 
Note : on écrit "npm.cmd" ici car PowerShell peut bloquer "npm"
(voir étape 2).
 
 
--------------------------------------------------------------
 ETAPE 2 - Corriger l'erreur PowerShell sur npm.ps1
--------------------------------------------------------------
Erreur rencontrée :
"Impossible de charger le fichier ...\npm.ps1, car l'exécution de
scripts est désactivée sur ce système."
 
Cause : Windows bloque par défaut les scripts .ps1 dans PowerShell.
 
Solution recommandée (sans droits administrateur) :
 
    Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
 
Réponds O (ou Y) à la confirmation, puis FERME et ROUVRE le terminal
(ou celui de VS Code).
 
Solutions alternatives :
- Utiliser "npm.cmd" à la place de "npm" (ex : npm.cmd install)
- Utiliser l'invite de commandes (cmd) au lieu de PowerShell
 
 
--------------------------------------------------------------
 ETAPE 3 - Se placer dans le dossier du projet
--------------------------------------------------------------
Dans le terminal, va dans le dossier de ton projet :
 
    cd "C:\chemin\vers\finder"
 
(Remplace par le vrai chemin. Astuce : dans l'Explorateur de
fichiers, clic droit sur le dossier > "Ouvrir dans le Terminal".)
 
Vérifie que tu es au bon endroit : le fichier package.json doit
être présent.
 
    dir package.json
 
 
--------------------------------------------------------------
 ETAPE 4 - Nettoyer l'ancienne installation (si besoin)
--------------------------------------------------------------
Pour repartir d'une base propre :
 
    Remove-Item -Recurse -Force node_modules
 
(Sous cmd : rmdir /s /q node_modules)
 
Optionnel, seulement en cas d'erreurs de dépendances persistantes :
supprime aussi package-lock.json. Sinon, GARDE-LE : il garantit
que les mêmes versions de paquets sont réinstallées.
 
 
--------------------------------------------------------------
 ETAPE 5 - Installer les dépendances
--------------------------------------------------------------
 
    npm install
 
Cette commande lit package.json et télécharge tout ce qu'il faut
dans le dossier node_modules. Cela peut prendre quelques minutes.
 
Si le projet est un monorepo (ex : dossiers "client" et "server"
ou "frontend" et "backend"), fais npm install dans CHAQUE dossier
qui contient un package.json.
 
 
--------------------------------------------------------------
 ETAPE 6 - Recréer le fichier de configuration (.env)
--------------------------------------------------------------
Les fichiers .env ne sont généralement pas versionnés (Git), donc
ils peuvent manquer après une réinstallation.
 
- Cherche un fichier .env.example ou .env.sample dans le projet.
- Copie-le :
 
      copy .env.example .env
 
- Ouvre .env et remplis les valeurs (clés API, URL de base de
  données, ports, etc.).
 
Ne partage jamais ton fichier .env publiquement.
 
 
--------------------------------------------------------------
 ETAPE 7 - Autres éléments à vérifier (selon ton projet)
--------------------------------------------------------------
- Base de données : est-elle installée et démarrée ?
  (MySQL, PostgreSQL, MongoDB, SQLite...)
- Migrations / seed : regarde dans package.json ou le README
  s'il existe une commande à lancer (ex : npm run migrate).
- Git : si le projet vient d'un dépôt, vérifie avec "git status"
  que tout est à jour (git pull si besoin).
 
 
--------------------------------------------------------------
 ETAPE 8 - Lancer le projet
--------------------------------------------------------------
Regarde la section "scripts" de package.json pour connaître les
commandes disponibles. Les plus courantes :
 
    npm run dev
    npm start
 
Puis ouvre l'adresse indiquée dans le terminal
(souvent http://localhost:3000 ou http://localhost:5173).
 
 
--------------------------------------------------------------
 DEPANNAGE RAPIDE
--------------------------------------------------------------
* "npm : Impossible de charger le fichier npm.ps1"
    -> Voir étape 2.
 
* "npm ERR! code ERESOLVE" (conflit de dépendances)
    -> Essaie : npm install --legacy-peer-deps
 
* "npm ERR! EACCES" ou erreurs de permissions
    -> Ferme VS Code et les programmes qui utilisent le dossier,
       puis relance le terminal en administrateur.
 
* "Cannot find module ..." au lancement
    -> Refais l'étape 4 puis l'étape 5.
 
* Erreurs de version de Node (ex : "engine incompatible")
    -> Regarde le champ "engines" de package.json ou le README
       et installe la version de Node demandée
       (outil pratique : nvm-windows).
 
* Nettoyer le cache npm en dernier recours :
    npm cache clean --force
 
 
--------------------------------------------------------------
 RESUME EN 6 COMMANDES
--------------------------------------------------------------
    Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
    cd "C:\chemin\vers\finder"
    Remove-Item -Recurse -Force node_modules
    npm install
    copy .env.example .env      (puis remplir .env)
    npm run dev
 
==============================================================
 