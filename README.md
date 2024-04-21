[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/snPWRHYg)

# Examenopdracht Web Services

-   Student: Jules Goubert
-   Studentennummer: 202291428
-   E-mailadres: <mailto:jules.goubert@student.hogent.be>

## Vereisten

Ik verwacht dat volgende software reeds geïnstalleerd is:

-   [NodeJS](https://nodejs.org)
-   [Yarn](https://yarnpkg.com)
-   [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)

Voor gebruiekers van Chocolatey:

```ps
choco install nodejs -y
choco install yarn -y
choco install mysql -y
choco install mysql.workbench -y
```

Ik verwacht ook dat u een [Spotify Developer](https://developer.spotify.com/) account heeft.

## Voor het starten van dit project

Maak een `.env` bestand aan dat de volgende template volgt:

```.env
NODE_ENV=development
DATABASE_PASSWORD=root
AUTH_JWT_SECRET=<kies zelf een secret>
SPOTIFY_CLIENT_SECRET=<jouw eigen spotify client secret>
SPOTIFY_CLIENT_ID=<jouw eigen spotify client id>
```

## Starten

-   Installeer alle dependencies: `yarn install`
-   Zorg ervoor dat het `.env` bestand dat hierboven gespecifieerd werd bestaat
-   Start de develoment server: `yarn start`

## Testen

-   Installeer alle dependencies: `yarn install`
-   Zorg ervoor dat er een `.env.test` bestand bestaat dat de volgende template volgt:

```.env
NODE_ENV=test
DATABASE_PASSWORD=root
```

-   Voer de testen uit: `yarn test`
-   Voer de testen uit met test-coverage: `yarn test:coverage`
