const { tables } = require("..");

module.exports = {
    up: async (knex) => {
        await knex.schema.createTable(tables.review, (table) => {
            table.increments("id");
            table.integer("rating").unsigned().notNullable();
            table.string("review_text", 5000);
            table.integer("song_id").unsigned();
            table
                .foreign("song_id", "fk_reviews_song")
                .references(`${tables.song}.id`)
                .onDelete("CASCADE");
            table.integer("album_id").unsigned();
            table
                .foreign("album_id", "fk_reviews_album")
                .references(`${tables.album}.id`)
                .onDelete("CASCADE");
            table.integer("user_id").unsigned().notNullable();
            table
                .foreign("user_id", "fk_reviews_user")
                .references(`${tables.user}.id`)
                .onDelete("CASCADE");
        });
    },
    down: (knex) => {
        return knex.schema.dropTableIfExits(tables.review);
    },
};
