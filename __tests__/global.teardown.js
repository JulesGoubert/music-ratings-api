const { shutdownData, getKnex, tables } = require("../src/data");

module.exports = async () => {
    // Remove any leftover data
    await getKnex()(tables.review).delete();
    await getKnex()(tables.album).delete();
    await getKnex()(tables.song).delete();
    await getKnex()(tables.artist).delete();
    await getKnex()(tables.user).delete();

    // Close database connection
    await shutdownData();
};
