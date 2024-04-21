module.exports = {
    log: {
        level: "info",
        disabled: false,
    },
    host: {
        port: 9000,
    },
    database: {
        client: "mysql2",
        host: "vichogent.be",
        port: 40043,
        name: "291428jg",
        username: "291428jg",
        password: "",
    },
    auth: {
        argon: {
            saltLength: 16,
            hashLength: 32,
            timeCost: 6,
            memoryCost: 2 ** 17,
        },
        jwt: {
            secret: "",
            expirationInterval: 60 * 60 * 1000, // ms (1 hour)
            issuer: "isdb.hogent.be",
            audience: "isdb.hogent.be",
        },
    },
    spotify: {
        clientId: "",
        clientSecret: "",
    },
};
