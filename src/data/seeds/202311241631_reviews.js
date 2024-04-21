const { tables } = require("..");

module.exports = {
    seed: async (knex) => {
        await knex(tables.review).delete();

        await knex(tables.review).insert([
            {
                id: 1,
                rating: 5,
                review_text: "Perfect nummer!",
                user_id: 2,
                song_id: 1,
                album_id: 1,
            },
            {
                id: 2,
                rating: 4,
                review_text: "Goed nummer!",
                user_id: 3,
                song_id: 2,
                album_id: 2,
            },
            {
                id: 3,
                rating: 2,
                review_text: "Slect nummer!",
                user_id: 2,
                song_id: 3,
                album_id: 3,
            },
        ]);
    },
};
