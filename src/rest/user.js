const Router = require("@koa/router");
const Joi = require("joi");

const userService = require("../service/user");
const validate = require("../core/validation");
const { requireAuthentication, makeRequireRole } = require("../core/auth");
const Role = require("../core/roles");

const checkUserId = async (ctx, next) => {
    const { userId, roles } = ctx.state.session;
    const { id } = ctx.params;

    if (id !== userId && !roles.includes(Role.ADMIN)) {
        throw ctx.throw(403, "You are not allowed to view this users info", {
            code: "FORBIDDEN",
        });
    }

    return next();
};

const login = async (ctx) => {
    const { email, password } = ctx.request.body;
    const token = await userService.login(email, password);
    ctx.body = token;
};

login.validationScheme = {
    body: {
        email: Joi.string().email(),
        password: Joi.string(),
    },
};

const register = async (ctx) => {
    const token = await userService.register(ctx.request.body);
    ctx.body = token;
    ctx.status = 200;
};

register.validationScheme = {
    body: {
        name: Joi.string().max(255),
        email: Joi.string().email(),
        password: Joi.string().min(6).max(30),
    },
};

const getAllUsers = async (ctx) => {
    ctx.body = await userService.getAll();
};

getAllUsers.validationScheme = null;

const getUserById = async (ctx) => {
    ctx.body = await userService.getById(ctx.params.id);
};

getUserById.validationScheme = {
    params: Joi.object({
        id: Joi.number().integer().positive(),
    }),
};

const updateUserById = async (ctx) => {
    ctx.body = await userService.updateById(ctx.params.id, ctx.request.body);
};

updateUserById.validationScheme = {
    params: Joi.object({
        id: Joi.number().integer().positive(),
    }),
    body: {
        name: Joi.string().max(100).optional(),
        email: Joi.string().email().optional(),
    },
};

const deleteUserById = async (ctx) => {
    await userService.deleteById(Number(ctx.params.id));
    ctx.status = 204;
};

deleteUserById.validationScheme = {
    params: Joi.object({
        id: Joi.number().integer().positive(),
    }),
};

module.exports = (app) => {
    const router = new Router({
        prefix: "/users",
    });

    router.post("/register", validate(register.validationScheme), register);
    router.post("/login", validate(login.validationScheme), login);

    const requireAdmin = makeRequireRole(Role.ADMIN);
    router.get(
        "/",
        requireAuthentication,
        requireAdmin,
        validate(getAllUsers.validationScheme),
        getAllUsers
    );
    router.get(
        "/:id",
        requireAuthentication,
        validate(getUserById.validationScheme),
        checkUserId,
        getUserById
    );
    router.put(
        "/:id",
        requireAuthentication,
        validate(updateUserById.validationScheme),
        checkUserId,
        updateUserById
    );
    router.delete(
        "/:id",
        requireAuthentication,
        validate(deleteUserById.validationScheme),
        checkUserId,
        deleteUserById
    );

    app.use(router.routes()).use(router.allowedMethods());
};
