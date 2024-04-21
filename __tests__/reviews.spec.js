const { tables } = require("../src/data");

const { testAuthHeader } = require("./common/auth");
const { login, withServer } = require("./supertest.setup");

const data = {
    reviews: [
        {
            id: 1,
            rating: 5,
            review_text: "Perfect nummer!",
            user_id: 1,
            song_id: 1,
            album_id: 1,
        },
        {
            id: 2,
            rating: 4,
            review_text: "Goed nummer!",
            user_id: 2,
            song_id: 2,
            album_id: 2,
        },
        {
            id: 3,
            rating: 4,
            review_text: "Goed nummer!",
            user_id: 1,
            song_id: 3,
            album_id: 3,
        },
    ],
    songs: [
        {
            id: 1,
            title: "Song 1",
            album_id: 1,
            artist_id: 1,
        },
        {
            id: 2,
            title: "Song 2",
            album_id: 2,
            artist_id: 2,
        },
        {
            id: 3,
            title: "Song 3",
            album_id: 3,
            artist_id: 3,
        },
    ],
    albums: [
        {
            id: 1,
            title: "Album 1",
            artist_id: 1,
        },
        {
            id: 2,
            title: "Album 2",
            artist_id: 2,
        },
        {
            id: 3,
            title: "Album 3",
            artist_id: 3,
        },
    ],
    artists: [
        {
            id: 1,
            name: "Artist 1",
        },
        {
            id: 2,
            name: "Artist 2",
        },
        {
            id: 3,
            name: "Artist 3",
        },
    ],
};
const dataToDelete = {
    reviews: [1, 2, 3],
    songs: [1, 2, 3],
    albums: [1, 2, 3],
    artists: [1, 2, 3],
};

describe("Reviews", () => {
    let request;
    let knex;
    let authHeader;

    const url = "/api/reviews";

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
            await knex(tables.review).insert(data.reviews);
        });

        afterAll(async () => {
            await knex(tables.review)
                .whereIn("id", dataToDelete.reviews)
                .delete();
            await knex(tables.song).whereIn("id", dataToDelete.songs).delete();
            await knex(tables.album)
                .whereIn("id", dataToDelete.albums)
                .delete();
            await knex(tables.artist)
                .whereIn("id", dataToDelete.artists)
                .delete();
        });

        test("should return 200 and all reviews of the logged in user", async () => {
            const response = await request
                .get(url)
                .set("Authorization", authHeader);
            expect(response.status).toBe(200);
            expect(response.body.count).toBe(2);
            expect(response.body.items[0]).toEqual({
                id: 1,
                rating: 5,
                reviewText: "Perfect nummer!",
                song: {
                    id: 1,
                    title: "Song 1",
                    artistId: 1,
                },
                album: {
                    id: 1,
                    title: "Album 1",
                    artistId: 1,
                },
                user: {
                    id: 1,
                    name: "Test User",
                },
            });
            expect(response.body.items[1].id).toBe(3);
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
            await knex(tables.song).insert(data.songs);
            await knex(tables.review).insert(data.reviews[0]);
        });

        afterAll(async () => {
            await knex(tables.review)
                .whereIn("id", dataToDelete.reviews)
                .delete();
            await knex(tables.song).whereIn("id", dataToDelete.songs).delete();
            await knex(tables.album)
                .whereIn("id", dataToDelete.albums)
                .delete();
            await knex(tables.artist)
                .whereIn("id", dataToDelete.artists)
                .delete();
        });

        test("should return 200 and the review with the given id", async () => {
            const response = await request
                .get(`${url}/1`)
                .set("Authorization", authHeader);
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                id: 1,
                rating: 5,
                reviewText: "Perfect nummer!",
                song: {
                    id: 1,
                    title: "Song 1",
                    artistId: 1,
                },
                album: {
                    id: 1,
                    title: "Album 1",
                    artistId: 1,
                },
                user: {
                    id: 1,
                    name: "Test User",
                },
            });
        });

        test("should return 404 when requesting not exisitng review", async () => {
            const response = await request
                .get(`${url}/999`)
                .set("Authorization", authHeader);
            expect(response.status).toBe(404);
            expect(response.body.code).toBe("NOT_FOUND");
            expect(response.body.message).toBe("No review with id 999 exists");
        });

        test("should return 400 with invalid review id", async () => {
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
        const reviewsToDelete = [];

        beforeAll(async () => {
            await knex(tables.artist).insert(data.artists);
            await knex(tables.album).insert(data.albums);
            await knex(tables.song).insert(data.songs);
        });

        afterAll(async () => {
            await knex(tables.review).whereIn("id", reviewsToDelete).delete();
            await knex(tables.song).whereIn("id", dataToDelete.songs).delete();
            await knex(tables.album)
                .whereIn("id", dataToDelete.albums)
                .delete();
            await knex(tables.artist)
                .whereIn("id", dataToDelete.artists)
                .delete();
        });

        test("should return 201 and the created review", async () => {
            const response = await request
                .post(url)
                .set("Authorization", authHeader)
                .send({
                    rating: 5,
                    reviewText: "All time favorite!",
                    songId: 1,
                    albumId: 1,
                });
            expect(response.status).toBe(201);
            expect(response.body.id).toBeTruthy();
            expect(response.body.rating).toBe(5);
            expect(response.body.reviewText).toBe("All time favorite!");
            expect(response.body.song).toEqual({
                id: 1,
                title: "Song 1",
                artistId: 1,
            });
            expect(response.body.album).toEqual({
                id: 1,
                title: "Album 1",
                artistId: 1,
            });
            expect(response.body.user).toEqual({
                id: 1,
                name: "Test User",
            });
            reviewsToDelete.push(response.body.id);
        });

        test("should return 404 when song and album don't exist", async () => {
            const response = await request
                .post(url)
                .set("Authorization", authHeader)
                .send({
                    rating: 5,
                    reviewText: "Perfect nummer!",
                    songId: 999,
                    albumId: 999,
                });
            expect(response.status).toBe(404);
            expect(response.body.code).toBe("NOT_FOUND");
            expect(response.body.message).toBe("No song with id 999 exists");
        });

        testAuthHeader(() => request.post(url));
    });

    describe(`PUT ${url}/:id`, () => {
        beforeAll(async () => {
            await knex(tables.artist).insert(data.artists);
            await knex(tables.album).insert(data.albums);
            await knex(tables.song).insert(data.songs);
            await knex(tables.review).insert(data.reviews[0]);
        });

        afterAll(async () => {
            await knex(tables.review)
                .whereIn("id", dataToDelete.reviews)
                .delete();
            await knex(tables.song).whereIn("id", dataToDelete.songs).delete();
            await knex(tables.album)
                .whereIn("id", dataToDelete.albums)
                .delete();
            await knex(tables.artist)
                .whereIn("id", dataToDelete.artists)
                .delete();
        });

        test("should return 200 and the updated review", async () => {
            const response = await request
                .put(`${url}/1`)
                .set("Authorization", authHeader)
                .send({
                    rating: 3,
                    reviewText: "Niet mijn stijl",
                });
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                id: 1,
                rating: 3,
                reviewText: "Niet mijn stijl",
                song: {
                    id: 1,
                    title: "Song 1",
                    artistId: 1,
                },
                album: {
                    id: 1,
                    title: "Album 1",
                    artistId: 1,
                },
                user: {
                    id: 1,
                    name: "Test User",
                },
            });
        });

        test("should return 404 when updating not existing review", async () => {
            const response = await request
                .put(`${url}/999`)
                .set("Authorization", authHeader)
                .send({
                    rating: 3,
                    reviewText: "Niet mijn stijl",
                });
            expect(response.status).toBe(404);
            expect(response.body.code).toBe("NOT_FOUND");
            expect(response.body.message).toBe("No review with id 999 exists");
        });

        test("should return 404 when song does't exist", async () => {
            const response = await request
                .put(`${url}/1`)
                .set("Authorization", authHeader)
                .send({
                    rating: 3,
                    reviewText: "Niet mijn stijl",
                    songId: 999,
                });
            expect(response.status).toBe(404);
            expect(response.body.code).toBe("NOT_FOUND");
            expect(response.body.message).toBe("No song with id 999 exists");
        });

        test("should return 404 when album does't exist", async () => {
            const response = await request
                .put(`${url}/1`)
                .set("Authorization", authHeader)
                .send({
                    rating: 3,
                    reviewText: "Niet mijn stijl",
                    albumId: 999,
                });
            expect(response.status).toBe(404);
            expect(response.body.code).toBe("NOT_FOUND");
            expect(response.body.message).toBe("No album with id 999 exists");
        });

        test("should return 400 with invalid review id", async () => {
            const response = await request
                .put(`${url}/invalid`)
                .set("Authorization", authHeader)
                .send({
                    rating: 3,
                    reviewText: "Niet mijn stijl",
                });
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
            await knex(tables.song).insert(data.songs);
            await knex(tables.review).insert(data.reviews[0]);
        });

        afterAll(async () => {
            await knex(tables.review)
                .whereIn("id", dataToDelete.reviews)
                .delete();
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

        test("should return 404 when deleting not existing review", async () => {
            const response = await request
                .delete(`${url}/999`)
                .set("Authorization", authHeader);
            expect(response.status).toBe(404);
            expect(response.body.code).toBe("NOT_FOUND");
            expect(response.body.message).toBe("No review with id 999 exists");
        });

        test("should return 400 with invalid review id", async () => {
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
