const { tables, getKnex } = require("../data");

const formatSong = ({
    album_id,
    album_title,
    artist_id,
    artist_name,
    ...rest
}) => ({
    ...rest,
    artist: {
        id: artist_id,
        name: artist_name,
    },
    album: {
        id: album_id,
        title: album_title,
    },
});

const SELECT_COLUMNS = [
    `${tables.song}.id`,
    `${tables.song}.title`,
    `${tables.artist}.id as artist_id`,
    `${tables.artist}.name as artist_name`,
    `${tables.album}.id as album_id`,
    `${tables.album}.title as album_title`,
];

const findAll = async () => {
    const transactions = await getKnex()(tables.song)
        .join(
            tables.artist,
            `${tables.song}.artist_id`,
            "=",
            `${tables.artist}.id`
        )
        .leftJoin(
            tables.album,
            `${tables.song}.album_id`,
            "=",
            `${tables.album}.id`
        )
        .select(SELECT_COLUMNS)
        .orderBy("id");
    return transactions.map(formatSong);
};

const findCount = async () => {
    const [count] = await getKnex()(tables.song).count();
    return count["count(*)"];
};

const findById = async (id) => {
    const song = await getKnex()(tables.song)
        .join(
            tables.artist,
            `${tables.song}.artist_id`,
            "=",
            `${tables.artist}.id`
        )
        .leftJoin(
            tables.album,
            `${tables.song}.album_id`,
            "=",
            `${tables.album}.id`
        )
        .where(`${tables.song}.id`, id)
        .first(SELECT_COLUMNS);

    return song && formatSong(song);
};

const create = async ({ title, artistId, albumId }) => {
    const [id] = await getKnex()(tables.song).insert({
        title,
        artist_id: artistId,
        album_id: albumId,
    });
    return id;
};

const updateById = async (id, { title, artistId, albumId }) => {
    const updateObj = {};
    
    if (title) updateObj.title = title;
    if (artistId) updateObj.artist_id = artistId;
    if (albumId) updateObj.album_id = albumId;

    await getKnex()(tables.song)
        .update(updateObj)
        .where(`${tables.song}.id`, id);
    return id;
};

const deleteById = async (id) => {
    const rowsAffected = await getKnex()(tables.song)
        .delete()
        .where(`${tables.song}.id`, id);
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
