const albumRepository = require("../repository/album");
const ServiceError = require("../core/serviceError");

const artistService = require("./artist");
const handleDBError = require("./_handleDBError");

const getAll = async () => {
    const items = await albumRepository.findAll();
    return { count: items.length, items };
};

const getById = async (id) => {
    const album = await albumRepository.findById(id);

    if (!album)
        throw ServiceError.notFound(`No album with id ${id} exists`, { id });

    return album;
};

const create = async ({ title, artistId }) => {
    const artist = await artistService.getById(artistId);

    if (!artist)
        throw ServiceError.notFound(`There is no artist with id ${artistId}`, {
            artistId,
        });

    try {
        const id = await albumRepository.create({ title, artistId });
        return getById(id);
    } catch (error) {
        throw handleDBError(error);
    }
};

const updateById = async (id, { title = null, artistId = null }) => {
    if (artistId) {
        const artist = await artistService.getById(artistId);

        if (!artist)
            throw ServiceError.notFound(`There is no artist with id ${id}`, {
                id,
            });
    }

    try {
        await albumRepository.updateById(id, { title, artistId });
        return getById(id);
    } catch (error) {
        throw handleDBError(error);
    }
};

const deleteById = async (id) => {
    try {
        const deleted = await albumRepository.deleteById(id);

        if (!deleted)
            throw ServiceError.notFound(`No album with id ${id} exists`, {
                id,
            });
    } catch (error) {
        throw handleDBError(error);
    }
};

module.exports = { getAll, getById, create, updateById, deleteById };
