const { tables, getKnex } = require("../data");

const formatAlbum = ({ artist_id, artist_name, ...rest }) => ({
    ...rest,
    artist: {
        id: artist_id,
        name: artist_name,
    },
});

const SELECT_COLUMNS = [
    `${tables.album}.id`,
    "title",
    `${tables.artist}.id as artist_id`,
    `${tables.artist}.name as artist_name`,
];

const findAll = async () => {
    const albums = await getKnex()(tables.album)
        .join(
            tables.artist,
            `${tables.album}.artist_id`,
            "=",
            `${tables.artist}.id`
        )
        .select(SELECT_COLUMNS)
        .orderBy("id");
    return albums.map(formatAlbum);
};

const findCount = async () => {
    const [count] = await getKnex()(tables.album).count();
    return count["count(*)"];
};

const findById = async (id) => {
    const album = await getKnex()(tables.album)
        .join(
            tables.artist,
            `${tables.album}.artist_id`,
            "=",
            `${tables.artist}.id`
        )
        .where(`${tables.album}.id`, id)
        .first(SELECT_COLUMNS);
    return album && formatAlbum(album);
};

const create = async ({ title, artistId }) => {
    const [id] = await getKnex()(tables.album).insert({
        title,
        artist_id: artistId,
    });
    return id;
};

const updateById = async (id, { title, artistId }) => {
    const updateObj = {};

    if (title) updateObj.title = title;
    if (artistId) updateObj.artist_id = artistId;

    await getKnex()(tables.album)
        .update(updateObj)
        .where(`${tables.album}.id`, id);
    return id;
};

const deleteById = async (id) => {
    const rowsAffected = await getKnex()(tables.album)
        .delete()
        .where(`${tables.album}.id`, id);
    return rowsAffected > 0;
};

module.exports = {
    findAll,
    findById,
    create,
    updateById,
    deleteById,
    findCount,
};
