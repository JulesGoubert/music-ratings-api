const { tables } = require("../src/data");

const {testAuthHeader} = require("./common/auth");
const { login, withServer } = require("./supertest.setup");

const data = {
    songs: [
        { id: 1, title: "song 1", album_id: 1, artist_id: 1 },
        { id: 2, title: "song 2", album_id: 1, artist_id: 1 },
        { id: 3, title: "song 3", album_id: 1, artist_id: 1 },
    ],
    albums: [{ id: 1, title: "album 1", artist_id: 1 }],
    artists: [{ id: 1, name: "artist 1" }],
};

const dataToDelete = {
    songs: [1, 2, 3],
    albums: [1],
    artists: [1],
};

describe("Songs", () => {
    let request;
    let knex;
    let authHeader;

    const url = "/api/songs";

    withServer(({ supertest, knex: k }) => {
        request = supertest;
        knex = k;
    });

    beforeAll(async () => {
        authHeader = await login(request);
    });

    describe(`GET ${url}`, () => {
        beforeAll(async () => {
            await knex(tables.artist).insert(data.artists);
            await knex(tables.album).insert(data.albums);
            await knex(tables.song).insert(data.songs);
        });

        afterAll(async () => {
            await knex(tables.song).whereIn("id", dataToDelete.songs).delete();
            await knex(tables.album)
                .whereIn("id", dataToDelete.albums)
                .delete();
            await knex(tables.artist)
                .whereIn("id", dataToDelete.artists)
                .delete();
        });

        test("should return 200 and all songs", async () => {
            const response = await request
                .get(url)
                .set("Authorization", authHeader);
            expect(response.status).toBe(200);
            expect(response.body.count).toBe(3);
            expect(response.body.items[0]).toEqual({
                id: 1,
                title: "song 1",
                artist: {
                    id: 1,
                    name: "artist 1",
                },
                album: {
                    id: 1,
                    title: "album 1",
                },
            });
            expect(response.body.items[1].id).toBe(2);
            expect(response.body.items[2].title).toBe("song 3");
        });

        test("should return 400 when given an argument", async () => {
            const response = await request
                .get(`${url}?invalid=true`)
                .set("Authorization", authHeader);
            expect(response.status).toBe(400);
            expect(response.body.code).toBe("VALIDATION_FAILED");
            expect(response.body.details.query).toHaveProperty("invalid");
        });

        testAuthHeader(() => request.get(url));
    });

    describe(`GET ${url}/:id`, () => {
        beforeAll(async () => {
            await knex(tables.artist).insert(data.artists);
            await knex(tables.album).insert(data.albums);
            await knex(tables.song).insert(data.songs[0]);
        });

        afterAll(async () => {
            await knex(tables.song).whereIn("id", dataToDelete.songs).delete();
            await knex(tables.artist)
                .whereIn("id", dataToDelete.artists)
                .delete();
            await knex(tables.album)
                .whereIn("id", dataToDelete.albums)
                .delete();
        });

        test("should return 200 and the song with the given id", async () => {
            const response = await request
                .get(`${url}/1`)
                .set("Authorization", authHeader);
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                id: 1,
                title: "song 1",
                artist: {
                    id: 1,
                    name: "artist 1",
                },
                album: {
                    id: 1,
                    title: "album 1",
                },
            });
        });

        test("should return 404 when requesting not exisitng song", async () => {
            const response = await request
                .get(`${url}/999`)
                .set("Authorization", authHeader);
            expect(response.status).toBe(404);
            expect(response.body.code).toBe("NOT_FOUND");
            expect(response.body.message).toBe("No song with id 999 exists");
        });

        test("should return 400 with invalid song id", async () => {
            const response = await request
                .get(`${url}/invalid`)
                .set("Authorization", authHeader);
            expect(response.status).toBe(400);
            expect(response.body.code).toBe("VALIDATION_FAILED");
            expect(response.body.details.params).toHaveProperty("id");
        });

        testAuthHeader(() => request.get(`${url}/1`));
    });

    describe(`POST ${url}`, () => {
        const songsToDelete = [];

        beforeAll(async () => {
            await knex(tables.artist).insert(data.artists);
            await knex(tables.album).insert(data.albums);
        });

        afterAll(async () => {
            await knex(tables.song).whereIn("id", songsToDelete).delete();
            await knex(tables.album)
                .whereIn("id", dataToDelete.albums)
                .delete();
            await knex(tables.artist)
                .whereIn("id", dataToDelete.artists)
                .delete();
        });

        test("should return 201 and the created song", async () => {
            const response = await request
                .post(url)
                .set("Authorization", authHeader)
                .send({
                    title: "song 1",
                    albumId: 1,
                    artistId: 1,
                });
            expect(response.status).toBe(201);
            expect(response.body.id).toBeTruthy();
            expect(response.body.title).toBe("song 1");
            expect(response.body.artist).toEqual({
                id: 1,
                name: "artist 1",
            });
            expect(response.body.album).toEqual({
                id: 1,
                title: "album 1",
            });
            songsToDelete.push(response.body.id);
        });

        test("should return 404 when artist doesn't exist", async () => {
            const response = await request
                .post(url)
                .set("Authorization", authHeader)
                .send({
                    title: "album 1",
                    albumId: 1,
                    artistId: 999,
                });
            expect(response.status).toBe(404);
            expect(response.body.code).toBe("NOT_FOUND");
            expect(response.body.message).toBe("No artist with id 999 exists");
        });

        test("should return 404 when album doesn't exist", async () => {
            const response = await request
                .post(url)
                .set("Authorization", authHeader)
                .send({
                    title: "album 1",
                    albumId: 999,
                    artistId: 1,
                });
            expect(response.status).toBe(404);
            expect(response.body.code).toBe("NOT_FOUND");
            expect(response.body.message).toBe("No album with id 999 exists");
        });

        testAuthHeader(() => request.post(url));
    });

    describe(`PUT ${url}/:id`, () => {
        beforeAll(async () => {
            await knex(tables.artist).insert(data.artists);
            await knex(tables.album).insert(data.albums);
            await knex(tables.song).insert(data.songs[0]);
        });

        afterAll(async () => {
            await knex(tables.song).whereIn("id", dataToDelete.songs).delete();
            await knex(tables.album)
                .whereIn("id", dataToDelete.albums)
                .delete();
            await knex(tables.artist)
                .whereIn("id", dataToDelete.artists)
                .delete();
        });

        test("should return 200 and the updated song", async () => {
            const response = await request
                .put(`${url}/1`)
                .set("Authorization", authHeader)
                .send({
                    title: "test",
                });
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                id: 1,
                title: "test",
                artist: {
                    id: 1,
                    name: "artist 1",
                },
                album: {
                    id: 1,
                    title: "album 1",
                },
            });
        });

        test("should return 404 when updating not existing song", async () => {
            const response = await request
                .put(`${url}/999`)
                .set("Authorization", authHeader)
                .send({ title: "test" });
            expect(response.status).toBe(404);
            expect(response.body.code).toBe("NOT_FOUND");
            expect(response.body.message).toBe("No song with id 999 exists");
        });

        test("should return 404 when artist does't exist", async () => {
            const response = await request
                .put(`${url}/1`)
                .set("Authorization", authHeader)
                .send({ artistId: 999 });
            expect(response.status).toBe(404);
            expect(response.body.code).toBe("NOT_FOUND");
            expect(response.body.message).toBe("No artist with id 999 exists");
        });

        test("should return 404 when album does't exist", async () => {
            const response = await request
                .put(`${url}/1`)
                .set("Authorization", authHeader)
                .send({ albumId: 999 });
            expect(response.status).toBe(404);
            expect(response.body.code).toBe("NOT_FOUND");
            expect(response.body.message).toBe("No album with id 999 exists");
        });

        test("should return 400 with invalid song id", async () => {
            const response = await request
                .put(`${url}/invalid`)
                .set("Authorization", authHeader)
                .send({ title: "test" });
            expect(response.status).toBe(400);
            expect(response.body.code).toBe("VALIDATION_FAILED");
            expect(response.body.details.params).toHaveProperty("id");
        });

        testAuthHeader(() => request.put(`${url}/1`));
    });

    describe(`DELETE ${url}/:id`, () => {
        beforeAll(async () => {
            await knex(tables.artist).insert(data.artists);
            await knex(tables.album).insert(data.albums);
            await knex(tables.song).insert(data.songs[0]);
        });

        afterAll(async () => {
            await knex(tables.song).whereIn("id", dataToDelete.songs).delete();
            await knex(tables.album)
                .whereIn("id", dataToDelete.albums)
                .delete();
            await knex(tables.artist)
                .whereIn("id", dataToDelete.artists)
                .delete();
        });

        test("should return 204 and nothing", async () => {
            const response = await request
                .delete(`${url}/1`)
                .set("Authorization", authHeader);
            expect(response.status).toBe(204);
            expect(response.body).toEqual({});
        });

        test("should return 404 when deleting not existing song", async () => {
            const response = await request
                .delete(`${url}/999`)
                .set("Authorization", authHeader);
            expect(response.status).toBe(404);
            expect(response.body.code).toBe("NOT_FOUND");
            expect(response.body.message).toBe("No song with id 999 exists");
        });

        test("should return 400 with invalid song id", async () => {
            const response = await request
                .delete(`${url}/invalid`)
                .set("Authorization", authHeader);
            expect(response.status).toBe(400);
            expect(response.body.code).toBe("VALIDATION_FAILED");
            expect(response.body.details.params).toHaveProperty("id");
        });

        testAuthHeader(() => request.delete(`${url}/1`));
    });
});
