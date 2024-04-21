const Router = require("@koa/router");
const Joi = require("joi");

const albumService = require("../service/album");
const validate = require("../core/validation");
const { requireAuthentication } = require("../core/auth");

const getAllAlbums = async (ctx) => {
    ctx.body = await albumService.getAll();
};

getAllAlbums.validationScheme = null;

const getAlbumById = async (ctx) => {
    ctx.body = await albumService.getById(ctx.params.id);
};

getAlbumById.validationScheme = {
    params: Joi.object({
        id: Joi.number().integer().positive(),
    }),
};

const createAlbum = async (ctx) => {
    const album = await albumService.create({
        ...ctx.request.body,
    });
    ctx.body = album;
    ctx.status = 201;
};

createAlbum.validationScheme = {
    body: {
        title: Joi.string().max(100),
        artistId: Joi.number().integer().positive(),
    },
};

const updateAlbumById = async (ctx) => {
    ctx.body = await albumService.updateById(ctx.params.id, ctx.request.body);
};

updateAlbumById.validationScheme = {
    params: Joi.object({
        id: Joi.number().integer().positive(),
    }),
    body: {
        title: Joi.string().max(100).optional(),
        artistId: Joi.number().integer().positive().optional(),
    },
};

const deleteAlbumById = async (ctx) => {
    await albumService.deleteById(ctx.params.id);
    ctx.status = 204;
};

deleteAlbumById.validationScheme = {
    params: Joi.object({
        id: Joi.number().integer().positive(),
    }),
};

module.exports = (app) => {
    const router = new Router({
        prefix: "/albums",
    });

    router.get(
        "/",
        requireAuthentication,
        validate(getAllAlbums.validationScheme),
        getAllAlbums
    );
    router.post(
        "/",
        requireAuthentication,
        validate(createAlbum.validationScheme),
        createAlbum
    );
    router.get(
        "/:id",
        requireAuthentication,
        validate(getAlbumById.validationScheme),
        getAlbumById
    );
    router.put(
        "/:id",
        requireAuthentication,
        validate(updateAlbumById.validationScheme),
        updateAlbumById
    );
    router.delete(
        "/:id",
        requireAuthentication,
        validate(deleteAlbumById.validationScheme),
        deleteAlbumById
    );

    app.use(router.routes()).use(router.allowedMethods());
};
