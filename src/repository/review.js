const { getLogger } = require("../core/logging");
const { tables, getKnex } = require("../data");

const formatReview = ({
    song_id,
    song_title,
    song_artist_id,
    album_id,
    album_title,
    album_artist_id,
    user_id,
    user_name,
    ...rest
}) => ({
    ...rest,
    song: {
        id: song_id,
        title: song_title,
        artistId: song_artist_id,
    },
    album: {
        id: album_id,
        title: album_title,
        artistId: album_artist_id,
    },
    user: {
        id: user_id,
        name: user_name,
    },
});

const SELECT_COLUMNS = [
    `${tables.review}.id`,
    "rating",
    "review_text as reviewText",
    `${tables.song}.id as song_id`,
    `${tables.song}.title as song_title`,
    `${tables.song}.artist_id as song_artist_id`,
    `${tables.user}.id as user_id`,
    `${tables.user}.name as user_name`,
    `${tables.album}.id as album_id`,
    `${tables.album}.title as album_title`,
    `${tables.album}.artist_id as album_artist_id`,
];

const findAll = async (userId) => {
    const albums = await getKnex()(tables.review)
        .leftJoin(
            tables.album,
            `${tables.review}.album_id`,
            "=",
            `${tables.album}.id`
        )
        .leftJoin(
            tables.song,
            `${tables.review}.song_id`,
            "=",
            `${tables.song}.id`
        )
        .join(tables.user, `${tables.review}.user_id`, "=", `${tables.user}.id`)
        .where(`${tables.review}.user_id`, userId)
        .select(SELECT_COLUMNS)
        .orderBy("id");
    return albums.map(formatReview);
};

const findById = async (id) => {
    let review = await getKnex()(tables.review)
        .leftJoin(
            tables.album,
            `${tables.review}.album_id`,
            "=",
            `${tables.album}.id`
        )
        .leftJoin(
            tables.song,
            `${tables.review}.song_id`,
            "=",
            `${tables.song}.id`
        )
        .join(tables.user, `${tables.review}.user_id`, "=", `${tables.user}.id`)
        .where(`${tables.review}.id`, id)
        .first(SELECT_COLUMNS);

    return review && formatReview(review);
};

const create = async ({ rating, reviewText, userId, songId, albumId }) => {
    const [id] = await getKnex()(tables.review).insert({
        rating,
        review_text: reviewText,
        song_id: songId,
        album_id: albumId,
        user_id: userId,
    });

    return id;
};

const updateById = async (
    id,
    { rating, reviewText, songId, albumId, userId }
) => {
    try {
        const updateObj = {};

        if (rating) updateObj.rating = rating;
        if (reviewText) updateObj.review_text = reviewText;
        if (songId) updateObj.song_id = songId;
        if (albumId) updateObj.album_id = albumId;
        if (userId) updateObj.user_id = userId;

        await getKnex()(tables.review)
            .update(updateObj)
            .where(`${tables.review}.id`, id);
        return id;
    } catch (error) {
        getLogger().error("Error updating review", { error });
        throw error;
    }
};

const deleteById = async (id, userId) => {
    const rowsAffected = await getKnex()(tables.review)
        .where(`${tables.review}.id`, id)
        .where(`${tables.review}.user_id`, userId)
        .delete();

    return rowsAffected > 0;
};

module.exports = {
    findAll,
    findById,
    create,
    updateById,
    deleteById,
};
