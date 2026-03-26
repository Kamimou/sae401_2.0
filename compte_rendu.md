# Compte rendu du PROJET DATA VISUALISATION

Pendant ce projet, on a du créer une application avec un backend et un frontend séparé. Le but c’était surtout de récupérer des données sur les logements et de les afficher avec des graphiques pour que ce soit plus compréhensible.

Pour le backend on a utilisé Symfony. Il sert à gérer la base de données (MySQL) et à envoyer les données au frontend sous forme de JSON. Au début les données étaient dans un fichier CSV donc on a du faire un script pour les importer correctement dans la base. Sans ça les données étaient pas vraiment utilisables.

Ensuite pour le frontend on a utilisé Angular. C’est lui qui affiche tout à l’écran. On a utilisé les signals pour gérer les données, ça permet de mettre à jour automatiquement les graphiques quand on change des filtres comme la région ou le département, donc c’est plus simple que de refaire plein de code à chaque fois.

Pour les graphiques on a utilisé Chart.js. On en a fait deux principaux. Le premier sert à comparer des données comme le chômage et les logements sociaux. Le deuxième affiche les données par département. Au début on avait fait un graphique en ligne mais ça donnait l’impression qu’il y avait une évolution dans le temps alors que pas du tout, du coup on a changé en graphique en barres.

On a quand même eu pas mal de problèmes. Le plus gros problème c’était le CORS. En gros Angular et Symfony communiquaient pas entre eux parce qu’ils étaient sur des ports différents. Donc il a fallu configurer Symfony pour autoriser les requêtes sinon ça marchait pas du tout.

On a aussi eu un problème avec Chart.js et le SSR. Comme Angular utilise un rendu côté serveur, parfois le graphique marchait pas parce qu’il a besoin du navigateur (window etc). Du coup on a du rajouter une condition pour éviter que ça plante.

Un autre truc c’est la performance. Le fichier CSV est assez gros donc si on affiche toutes les données ça devient lent. On a donc limité le nombre de données affichées pour que ce soit plus fluide.

Aussi il fallait faire attention au fichier .env. Une petite erreur dedans (genre mauvais port ou mauvais mot de passe) et plus rien marchait, on avait juste une page vide donc c’était pas toujours évident de comprendre d’où venait le problème.

Au final le projet fonctionne bien. On a réussi à connecter le backend avec le frontend et afficher les données correctement. Même si on a galéré sur certains points, ça nous a permis de mieux comprendre comment fonctionne une API et comment l’utiliser avec Angular.
