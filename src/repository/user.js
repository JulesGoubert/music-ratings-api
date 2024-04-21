const { tables, getKnex } = require("../data");

const findAll = async () => {
    return await getKnex()(tables.user).select().orderBy("id");
};

const findCount = async () => {
    const [count] = await getKnex()(tables.user).count();
    return count["count(*)"];
};

const findById = async (id) => {
    return await getKnex()(tables.user).where("id", id).first();
};

const findByEmail = async (email) => {
    return await getKnex()(tables.user).where("email", email).first();
};

const create = async ({ name, email, passwordHash, roles }) => {
    const [id] = await getKnex()(tables.user).insert({
        name,
        email,
        password_hash: passwordHash,
        roles: JSON.stringify(roles),
    });
    return id;
};

const updateById = async (id, { name, email }) => {
    const updateObj = {};
    
    if (name) updateObj.name = name;
    if (email) updateObj.email = email;

    await getKnex()(tables.user).update(updateObj).where("id", id);
    return id;
};

const deleteById = async (id) => {
    const rowsAffected = await getKnex()(tables.user).delete().where("id", id);
    return rowsAffected > 0;
};

module.exports = {
    findAll,
    findById,
    findByEmail,
    create,
    updateById,
    deleteById,
    findCount,
};
