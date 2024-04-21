const Router = require("@koa/router");

const installSongRouter = require("./song");
const installAlbumRouter = require("./album");
const installArtistRouter = require("./artist");
const installReviewRouter = require("./review");
const installUserRouter = require("./user");
const installHealthRouter = require("./health");

module.exports = (app) => {
    const router = new Router({
        prefix: "/api",
    });

    installAlbumRouter(router);
    installSongRouter(router);
    installArtistRouter(router);
    installReviewRouter(router);
    installUserRouter(router);
    installHealthRouter(router);

    app.use(router.routes()).use(router.allowedMethods());
};
