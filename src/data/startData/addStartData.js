const Role = require("../../core/roles");

const { getStartData } = require("./getStartData");

async function addStartData(knex, tables) {
    await knex(tables.song).delete();
    await knex(tables.album).delete();
    await knex(tables.artist).delete();
    await knex(tables.user).delete();

    const { artists, albums, songs } = await getStartData();

    await knex(tables.artist).insert(artists);
    await knex(tables.album).insert(albums);
    await knex(tables.song).insert(songs);
    await knex(tables.user).insert([
        {
            id: 1,
            name: "admin",
            email: "admin@gmail.com",
            password_hash:
                "$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4",
            roles: JSON.stringify([Role.USER, Role.ADMIN]),
        },
    ]);
}

module.exports = { addStartData };
