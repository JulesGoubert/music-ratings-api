const { tables } = require("..");

module.exports = {
    up: async (knex) => {
        await knex.schema.createTable(tables.album, (table) => {
            table.increments("id");
            table.string("title", 255).notNullable();
            table.unique("title", "idx_album_title_unique");
            table.integer("artist_id").unsigned().notNullable();
            table
                .foreign("artist_id", "fk_albums_artist")
                .references(`${tables.artist}.id`)
                .onDelete("CASCADE");
        });
    },
    down: (knex) => {
        return knex.schema.dropTableIfExits(tables.place);
    },
};
