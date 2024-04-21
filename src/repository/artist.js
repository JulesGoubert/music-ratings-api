const { tables, getKnex } = require("../data");

const findAll = async () => {
    return await getKnex()(tables.artist).select().orderBy("id");
};

const findCount = async () => {
    const [count] = await getKnex()(tables.artist).count();
    return count["count(*)"];
};

const findById = async (id) => {
    return await getKnex()(tables.artist).where("id", id).first();
};

const create = async ({ name }) => {
    const [id] = await getKnex()(tables.artist).insert({
        name,
    });
    return id;
};

const updateById = async (id, { name }) => {
    await getKnex()(tables.artist).update({ name }).where("id", id);
    return id;
};

const deleteById = async (id) => {
    const rowsAffected = await getKnex()(tables.artist)
        .delete()
        .where("id", id);
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
