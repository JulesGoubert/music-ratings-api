const artistRepository = require("../repository/artist");
const ServiceError = require("../core/serviceError");

const handleDBError = require("./_handleDBError");

const getAll = async () => {
    const items = await artistRepository.findAll();
    return { count: items.length, items };
};

const getById = async (id) => {
    const artist = await artistRepository.findById(id);

    if (!artist)
        throw ServiceError.notFound(`No artist with id ${id} exists`, { id });

    return artist;
};

const create = async ({ name }) => {
    try {
        const id = await artistRepository.create({ name });
        return getById(id);
    } catch (error) {
        throw handleDBError(error);
    }
};

const updateById = async (id, { name }) => {
    try {
        await artistRepository.updateById(id, { name });
        return getById(id);
    } catch (error) {
        throw handleDBError(error);
    }
};

const deleteById = async (id) => {
    try {
        const deleted = await artistRepository.deleteById(id);

        if (!deleted)
            throw ServiceError.notFound(`No artist with id ${id} exists`, {
                id,
            });
    } catch (error) {
        throw handleDBError(error);
    }
};

module.exports = { getAll, getById, create, updateById, deleteById };
