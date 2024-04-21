const userServices = require("../service/user");

const requireAuthentication = async (ctx, next) => {
    const { authorization } = ctx.headers;

    const { authToken, ...session } = await userServices.checkAndParseSession(
        authorization
    );

    ctx.state.session = session;
    ctx.state.authToken = authToken;

    return next();
};

const makeRequireRole = (role) => async (ctx, next) => {
    const { roles = [] } = ctx.state.session;

    userServices.checkRole(role, roles);

    return next();
};

module.exports = { requireAuthentication, makeRequireRole };
