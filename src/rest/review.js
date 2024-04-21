const Router = require("@koa/router");
const Joi = require("joi");

const reviewService = require("../service/review");
const validate = require("../core/validation");
const { requireAuthentication } = require("../core/auth");

const getAllReviews = async (ctx) => {
    const { userId } = ctx.state.session;
    ctx.body = await reviewService.getAll(userId);
};

getAllReviews.validationScheme = null;

const getReviewById = async (ctx) => {
    ctx.body = await reviewService.getById(
        ctx.params.id,
        ctx.state.session.userId
    );
};

getReviewById.validationScheme = {
    params: Joi.object({
        id: Joi.number().integer().positive(),
    }),
};

const createReview = async (ctx) => {
    const review = await reviewService.create({
        ...ctx.request.body,
        userId: ctx.state.session.userId,
    });
    ctx.body = review;
    ctx.status = 201;
};

createReview.validationScheme = {
    body: {
        rating: Joi.number().integer().positive().min(0).max(10),
        reviewText: Joi.string().max(1000),
        songId: Joi.number().integer().positive().optional(),
        albumId: Joi.number().integer().positive().optional(),
    },
};

const updateReviewById = async (ctx) => {
    ctx.body = await reviewService.updateById(ctx.params.id, {
        ...ctx.request.body,
        userId: ctx.state.session.userId,
    });
};

updateReviewById.validationScheme = {
    params: Joi.object({
        id: Joi.number().integer().positive(),
    }),
    body: {
        rating: Joi.number().integer().positive().optional(),
        reviewText: Joi.string().max(1000).optional(),
        songId: Joi.number().integer().positive().optional(),
        albumId: Joi.number().integer().positive().optional(),
    },
};

const deleteReviewById = async (ctx) => {
    await reviewService.deleteById(ctx.params.id, ctx.state.session.userId);
    ctx.status = 204;
};

deleteReviewById.validationScheme = {
    params: Joi.object({
        id: Joi.number().integer().positive(),
    }),
};

module.exports = (app) => {
    const router = new Router({
        prefix: "/reviews",
    });

    router.get(
        "/",
        requireAuthentication,
        validate(getAllReviews.validationScheme),
        getAllReviews
    );
    router.post(
        "/",
        requireAuthentication,
        validate(createReview.validationScheme),
        createReview
    );
    router.get(
        "/:id",
        requireAuthentication,
        validate(getReviewById.validationScheme),
        getReviewById
    );
    router.put(
        "/:id",
        requireAuthentication,
        validate(updateReviewById.validationScheme),
        updateReviewById
    );
    router.delete(
        "/:id",
        requireAuthentication,
        validate(deleteReviewById.validationScheme),
        deleteReviewById
    );

    app.use(router.routes()).use(router.allowedMethods());
};
