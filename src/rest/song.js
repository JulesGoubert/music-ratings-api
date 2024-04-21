const Router = require("@koa/router");
const Joi = require("joi");

const songService = require("../service/song");
const validate = require("../core/validation");
const { requireAuthentication } = require("../core/auth");

const getAllSongs = async (ctx) => {
    ctx.body = await songService.getAll();
};

getAllSongs.validationScheme = null;

const getSongById = async (ctx) => {
    ctx.body = await songService.getById(ctx.params.id);
};

getSongById.validationScheme = {
    params: Joi.object({
        id: Joi.number().integer().positive(),
    }),
};

const createSong = async (ctx) => {
    const song = await songService.create({
        ...ctx.request.body,
    });
    ctx.body = song;
    ctx.status = 201;
};

createSong.validationScheme = {
    body: {
        title: Joi.string(),
        albumId: Joi.number().integer().positive().optional(),
        artistId: Joi.number().integer().positive(),
    },
};

const updateSongById = async (ctx) => {
    ctx.body = await songService.updateById(ctx.params.id, ctx.request.body);
};

updateSongById.validationScheme = {
    params: Joi.object({
        id: Joi.number().integer().positive(),
    }),
    body: {
        title: Joi.string().optional(),
        albumId: Joi.number().integer().positive().optional(),
        artistId: Joi.number().integer().positive().optional(),
    },
};

const deleteSongById = async (ctx) => {
    await songService.deleteById(ctx.params.id);
    ctx.status = 204;
};

deleteSongById.validationScheme = {
    params: Joi.object({
        id: Joi.number().integer().positive(),
    }),
};

module.exports = (app) => {
    const router = new Router({
        prefix: "/songs",
    });

    router.get(
        "/",
        requireAuthentication,
        validate(getAllSongs.validationScheme),
        getAllSongs
    );
    router.post(
        "/",
        requireAuthentication,
        validate(createSong.validationScheme),
        createSong
    );
    router.get(
        "/:id",
        requireAuthentication,
        validate(getSongById.validationScheme),
        getSongById
    );
    router.put(
        "/:id",
        requireAuthentication,
        validate(updateSongById.validationScheme),
        updateSongById
    );
    router.delete(
        "/:id",
        requireAuthentication,
        validate(deleteSongById.validationScheme),
        deleteSongById
    );

    app.use(router.routes()).use(router.allowedMethods());
};
