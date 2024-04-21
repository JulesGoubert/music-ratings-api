const userRepository = require("../repository/user");
const { getLogger } = require("../core/logging");
const { hashPassword, verifyPassword } = require("../core/password");
const Role = require("../core/roles");
const ServiceError = require("../core/serviceError");
const { generateJWT, verifyJWT } = require("../core/jwt");

const handleDBError = require("./_handleDBError");

const checkAndParseSession = async (authHeader) => {
    if (!authHeader)
        throw ServiceError.unauthorized("You need to be signed in");

    if (!authHeader.startsWith("Bearer"))
        throw ServiceError.unauthorized("Invalid authentication token");

    const authToken = authHeader.substring(7);
    try {
        const { userId, roles } = await verifyJWT(authToken);
        return { userId, roles, authToken };
    } catch (error) {
        getLogger().error(error.message, { error });
        throw new Error(error.message);
    }
};

const checkRole = (role, roles) => {
    const hasPermission = roles.includes(role);

    if (!hasPermission) {
        throw ServiceError.forbidden(
            "You are not allowed to view this part of the application"
        );
    }
};

const makeExposedUser = ({ id, name, email, roles }) => ({
    id,
    name,
    email,
    roles,
});

const makeLoginData = async (user) => {
    const token = await generateJWT(user);
    return { token, user: makeExposedUser(user) };
};

const login = async (email, password) => {
    const user = await userRepository.findByEmail(email);

    if (!user)
        throw ServiceError.unauthorized("Email or password do not match");

    const valid = await verifyPassword(password, user.password_hash);

    if (!valid)
        throw ServiceError.unauthorized("Email or password do not match");

    return await makeLoginData(user);
};

const getAll = async () => {
    const items = await userRepository.findAll();
    return { count: items.length, items: items.map(makeExposedUser) };
};

const getById = async (id) => {
    const user = await userRepository.findById(id);

    if (!user) throw new Error(`No user with id ${id} exists`, { id });

    return makeExposedUser(user);
};

const register = async ({ name, email, password }) => {
    try {
        const passwordHash = await hashPassword(password);
        const id = await userRepository.create({
            name,
            email,
            passwordHash,
            roles: [Role.USER],
        });
        const user = await getById(id);
        return await makeLoginData(user);
    } catch (error) {
        throw handleDBError(error);
    }
};

const updateById = async (id, { name = null, email = null }) => {
    try {
        await userRepository.updateById(id, { name, email });
        return await getById(id);
    } catch (error) {
        throw handleDBError(error);
    }
};

const deleteById = async (id) => {
    try {
        const deleted = await userRepository.deleteById(id);
        if (!deleted)
            throw ServiceError.notFound(`No user with id ${id} exists`, {
                id,
            });
    } catch (error) {
        throw handleDBError(error);
    }
};

module.exports = {
    login,
    getAll,
    getById,
    register,
    updateById,
    deleteById,
    checkAndParseSession,
    checkRole,
};
