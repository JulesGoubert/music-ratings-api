const { tables } = require("..");
const Role = require("../../core/roles");

module.exports = {
    seed: async (knex) => {
        await knex(tables.user).insert([
            {
                id: 2,
                name: "Bob",
                email: "bob@gmail.com",
                password_hash:
                    "$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4",
                roles: JSON.stringify([Role.USER, Role.ADMIN]),
            },
            {
                id: 3,
                name: "Alice",
                email: "alice@gmail.com",
                password_hash:
                    "$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4",
                roles: JSON.stringify([Role.USER]),
            },
        ]);
    },
};
