# Guide d'installation - SAE 401

Ce projet est un tableau de bord permettant d'analyser les données de logement et de précarité pour l'aménagement du territoire.

## 1. Logiciels requis

Avant de commencer, il faut avoir installé ces outils :
- PHP (version 8.1 minimum)
- Composer
- Symfony CLI (pour lancer le serveur)
- Node.js et npm (pour Angular)
- Angular CLI
- Un serveur MySQL local (comme XAMPP)

## 2. Installation du Backend (Symfony)

- Ouvrir un terminal dans le dossier racine : `sae401_2.0`
- Lancer l'installation des dépendances :
  `composer install`

- Configurer la base de données dans le fichier `.env` :
  Vérifier la ligne DATABASE_URL pour correspondre à votre configuration MySQL.
  Exemple pour XAMPP :
  `DATABASE_URL="mysql://root:@127.0.0.1:3306/sae401_2_0?serverVersion=10.4.32-MariaDB&charset=utf8mb4"`

- Créer la base et les tables :
  `php bin/console doctrine:database:create`
  `php bin/console doctrine:migrations:migrate`

- Importer les données du fichier CSV :
  `php bin/console app:import:stats-logement src/Command/logements-et-logements-sociaux-dans-les-departements.csv`

- Lancer le serveur Symfony :
  `symfony server:start`

## 3. Installation du Frontend (Angular)

- Se déplacer dans le dossier du front :
  `cd ./front-sae401`

- Installer les dépendances npm :
  `npm install`

- Lancer le projet Angular :
  `ng serve`

## 4. Utilisation

Une fois que les deux terminaux tournent :
- Le backend est accessible sur http://localhost:8000
- Le frontend est accessible sur http://localhost:4200

Ouvrir le navigateur sur http://localhost:4200 pour voir le projet.
