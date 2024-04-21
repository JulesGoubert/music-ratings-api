module.exports = {
    port: 9000,
    log: {
        level: "silly",
        disabled: false,
    },
    host: {
        port: 9000,
    },
    database: {
        client: "mysql2",
        host: "localhost",
        port: 3306,
        name: "isdb",
        username: "root",
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
