const { tables } = require("..");

module.exports = {
    seed: async (knex) => {
        await knex(tables.song).insert([
            { id: 101, title: "Song 1", album_id: 1, artist_id: 1 },
            { id: 102, title: "Song 2", album_id: 2, artist_id: 2 },
            { id: 103, title: "Song 3", album_id: 3, artist_id: 3 },
        ]);
    },
};
