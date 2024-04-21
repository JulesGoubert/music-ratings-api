const { tables } = require("..");

module.exports = {
    seed: async (knex) => {
        await knex(tables.album).insert([
            { id: 101, title: "Album 1", artist_id: 1 },
            { id: 102, title: "Album 2", artist_id: 2 },
            { id: 103, title: "Album 3", artist_id: 3 },
        ]);
    },
};
