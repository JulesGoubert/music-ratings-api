module.exports = {
    env: "NODE_ENV",
    port: "PORT",
    database: {
        password: "DATABASE_PASSWORD",
    },
    auth: {
        jwt: {
            secret: "AUTH_JWT_SECRET",
        },
    },
    spotify: {
        clientId: "SPOTIFY_CLIENT_ID",
        clientSecret: "SPOTIFY_CLIENT_SECRET",
    },
};
