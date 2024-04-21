const songRepository = require("../repository/song");
const ServiceError = require("../core/serviceError");

const albumService = require("./album");
const artistService = require("./artist");
const handleDBError = require("./_handleDBError");

const getAll = async () => {
    const items = await songRepository.findAll();
    return { count: items.length, items };
};

const getById = async (id) => {
    const song = await songRepository.findById(id);

    if (!song)
        throw ServiceError.notFound(`No song with id ${id} exists`, { id });

    return song;
};

const create = async ({ title, artistId, albumId = null }) => {
    const artist = await artistService.getById(artistId);

    if (!artist)
        throw ServiceError.notFound(`There is no artist with id ${artistId}`, {
            artistId,
        });
    if (albumId) {
        const album = await albumService.getById(albumId);
        if (!album)
            throw ServiceError.notFound(
                `There is no album with id ${albumId}`,
                {
                    albumId,
                }
            );
    }
    try {
        const id = await songRepository.create({ title, artistId, albumId });
        return getById(id);
    } catch (error) {
        throw handleDBError(error);
    }
};

const updateById = async (
    id,
    { title = null, artistId = null, albumId = null }
) => {
    if (artistId) {
        const artist = await artistService.getById(artistId);
        if (!artist)
            throw ServiceError.notFound(
                `There is no artist with id ${artistId}`,
                {
                    artistId,
                }
            );
    }

    if (albumId) {
        const album = await albumService.getById(albumId);
        if (!album)
            throw ServiceError.notFound(
                `There is no album with id ${albumId}`,
                {
                    albumId,
                }
            );
    }

    try {
        await songRepository.updateById(id, { title, artistId, albumId });
        return getById(id);
    } catch (error) {
        throw handleDBError(error);
    }
};

const deleteById = async (id) => {
    try {
        const deleted = await songRepository.deleteById(id);

        if (!deleted)
            throw ServiceError.notFound(`No song with id ${id} exists`, { id });
    } catch (error) {
        throw handleDBError(error);
    }
};

module.exports = { getAll, getById, create, updateById, deleteById };
