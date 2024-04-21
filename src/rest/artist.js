const Router = require("@koa/router");
const Joi = require("joi");

const artistService = require("../service/artist");
const validate = require("../core/validation");
const { requireAuthentication } = require("../core/auth");

const getAllArtists = async (ctx) => {
    ctx.body = await artistService.getAll();
};

getAllArtists.validationScheme = null;

const getArtistById = async (ctx) => {
    ctx.body = await artistService.getById(ctx.params.id);
};

getArtistById.validationScheme = {
    params: Joi.object({
        id: Joi.number().integer().positive(),
    }),
};

const createArtist = async (ctx) => {
    const artist = await artistService.create(ctx.request.body);
    ctx.body = artist;
    ctx.status = 201;
};

createArtist.validationScheme = {
    body: {
        name: Joi.string().max(100),
    },
};

const updateArtistById = async (ctx) => {
    ctx.body = await artistService.updateById(ctx.params.id, ctx.request.body);
};

updateArtistById.validationScheme = {
    params: Joi.object({
        id: Joi.number().integer().positive(),
    }),
    body: {
        name: Joi.string().max(100).optional(),
    },
};

const deleteArtistById = async (ctx) => {
    await artistService.deleteById(ctx.params.id);
    ctx.status = 204;
};

deleteArtistById.validationScheme = {
    params: Joi.object({
        id: Joi.number().integer().positive(),
    }),
};

module.exports = (app) => {
    const router = new Router({
        prefix: "/artists",
    });

    router.get(
        "/",
        requireAuthentication,
        validate(getAllArtists.validationScheme),
        getAllArtists
    );
    router.post(
        "/",
        requireAuthentication,
        validate(createArtist.validationScheme),
        createArtist
    );
    router.get(
        "/:id",
        requireAuthentication,
        validate(getArtistById.validationScheme),
        getArtistById
    );
    router.put(
        "/:id",
        requireAuthentication,
        validate(updateArtistById.validationScheme),
        updateArtistById
    );
    router.delete(
        "/:id",
        requireAuthentication,
        validate(deleteArtistById.validationScheme),
        deleteArtistById
    );

    app.use(router.routes()).use(router.allowedMethods());
};
