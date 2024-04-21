const { tables } = require("..");

module.exports = {
    up: async (knex) => {
        await knex.schema.createTable(tables.artist, (table) => {
            table.increments("id");
            table.string("name", 255).notNullable();
            table.unique("name", "idx_artist_name_unique");
        });
    },
    down: (knex) => {
        return knex.schema.dropTableIfExits(tables.artist);
    },
};
