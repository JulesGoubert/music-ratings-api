const reviewRepository = require("../repository/review");
const ServiceError = require("../core/serviceError");

const albumService = require("./album");
const songService = require("./song");
const handleDBError = require("./_handleDBError");

const getAll = async (userId) => {
    const items = await reviewRepository.findAll(userId);
    return { count: items.length, items };
};

const getById = async (id, userId) => {
    const review = await reviewRepository.findById(id);

    if (!review || review.user.id !== userId)
        throw ServiceError.notFound(`No review with id ${id} exists`, { id });

    return review;
};

const create = async ({
    rating,
    reviewText,
    userId,
    songId = null,
    albumId = null,
}) => {
    if (!songId && !albumId)
        throw ServiceError.forbidden(
            "A review should contain a songId or an albumId",
            {
                songId,
                albumId,
            }
        );

    if (songId) {
        const song = await songService.getById(songId);

        if (!song)
            throw ServiceError.notFound(`There is no song with id ${songId}`, {
                songId,
            });

        if (!albumId) albumId = song.album.id;
    }

    if (albumId) {
        const album = await albumService.getById(albumId);

        if (!album)
            throw ServiceError.notFound(
                `There is no album witn id ${albumId}`,
                {
                    albumId,
                }
            );
    }

    try {
        const id = await reviewRepository.create({
            rating,
            reviewText,
            userId,
            songId,
            albumId,
        });
        return getById(id, userId);
    } catch (error) {
        throw handleDBError(error);
    }
};

const updateById = async (
    id,
    {
        rating = null,
        reviewText = null,
        songId = null,
        albumId = null,
        userId = null,
    }
) => {
    if (songId) {
        const song = await songService.getById(songId);

        if (!song)
            throw ServiceError.notFound(`There is no song with id ${songId}`, {
                songId,
            });
    }
    if (albumId) {
        const album = await albumService.getById(albumId);

        if (!album)
            throw ServiceError.notFound(
                `There is no album witn id ${albumId}`,
                {
                    albumId,
                }
            );
    }

    try {
        await reviewRepository.updateById(id, {
            rating,
            reviewText,
            songId,
            albumId,
            userId,
        });
        return getById(id, userId);
    } catch (error) {
        throw handleDBError(error);
    }
};

const deleteById = async (id, userId) => {
    try {
        const deleted = await reviewRepository.deleteById(id, userId);

        if (!deleted)
            throw ServiceError.notFound(`No review with id ${id} exists`, {
                id,
            });
    } catch (error) {
        throw handleDBError(error);
    }
};

module.exports = { getAll, getById, create, updateById, deleteById };
