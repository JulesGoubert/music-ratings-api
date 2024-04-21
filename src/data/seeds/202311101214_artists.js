const { tables } = require("..");

module.exports = {
    seed: async (knex) => {
        await knex(tables.artist).insert([
            { id: 101, name: "Artist 1" },
            { id: 102, name: "Artist 2" },
            { id: 103, name: "Artist 3" },
        ]);
    },
};
