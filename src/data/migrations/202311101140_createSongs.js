const { tables } = require("..");

module.exports = {
    up: async (knex) => {
        await knex.schema.createTable(tables.song, (table) => {
            table.increments("id");
            table.string("title", 255).notNullable();
            table.integer("artist_id").unsigned().notNullable();
            table
                .foreign("artist_id", "fk_songs_artist")
                .references(`${tables.artist}.id`)
                .onDelete("CASCADE");
            table.integer("album_id").unsigned();
            table
                .foreign("album_id", "fk_songs_album")
                .references(`${tables.album}.id`)
                .onDelete("CASCADE");
        });
    },
    down: (knex) => {
        return knex.schema.dropTableIfExits(tables.place);
    },
};
