const createServer = require("./createServer");

const main = async () => {
    try {
        const server = await createServer();
        await server.start();

        const onClose = async () => {
            // cleanup
            await server.stop();
            // stop process
            process.exit(0);
        };
        process.on("SIGTERM", onClose);
        process.on("SIGQUIT", onClose);
    } catch (error) {
        console.log(error);
        process.exit(-1);
    }
};

main();
