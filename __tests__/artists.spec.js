const { tables } = require("../src/data");

const { loginAdmin, withServer } = require("./supertest.setup");
const { testAuthHeader } = require("./common/auth");

const data = {
    artists: [
        {
            id: 1,
            name: "Kendrick Lamar",
        },
        {
            id: 2,
            name: "J. Cole",
        },
        {
            id: 3,
            name: "A$AP Rocky",
        },
    ],
};
const dataToDelete = {
    artists: [1, 2, 3],
};

describe("Artists", () => {
    let request;
    let knex;
    let authHeader;

    withServer(({ supertest, knex: k }) => {
        request = supertest;
        knex = k;
    });

    const url = "/api/artists";

    beforeAll(async () => {
        authHeader = await loginAdmin(request);
    });

    describe(`GET ${url}`, () => {
        beforeAll(async () => {
            // testdata aan db toevoegen
            await knex(tables.artist).insert(data.artists);
        });

        afterAll(async () => {
            // verwijder alle testdata uit db
            await knex(tables.artist)
                .whereIn("id", dataToDelete.artists)
                .delete();
        });

        test("should return 200 and all artists", async () => {
            const response = await request
                .get(url)
                .set("Authorization", authHeader);
            expect(response.status).toBe(200);
            expect(response.body.count).toBe(3);
            expect(response.body.items[0]).toEqual({
                id: 1,
                name: "Kendrick Lamar",
            });
            expect(response.body.items[1]).toEqual({
                id: 2,
                name: "J. Cole",
            });
            expect(response.body.items[2]).toEqual({
                id: 3,
                name: "A$AP Rocky",
            });
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
            // testdata aan db toevoegen
            await knex(tables.artist).insert(data.artists[0]);
        });

        afterAll(async () => {
            // verwijder alle testdata uit db
            await knex(tables.artist)
                .whereIn("id", dataToDelete.artists)
                .delete();
        });

        test("should return 200 and the artist with id 1", async () => {
            const response = await request
                .get(`${url}/1`)
                .set("Authorization", authHeader);
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                id: 1,
                name: "Kendrick Lamar",
            });
        });

        test("should return 404 when requesting not exisitng artist", async () => {
            const response = await request
                .get(`${url}/999`)
                .set("Authorization", authHeader);
            expect(response.status).toBe(404);
            expect(response.body.code).toBe("NOT_FOUND");
            expect(response.body.message).toBe("No artist with id 999 exists");
        });

        test("should return 400 with invalid artist id", async () => {
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
        const artistsToDelete = [];

        afterAll(async () => {
            await knex(tables.artist).whereIn("id", artistsToDelete).delete();
        });

        test("should return 201 and the created artist", async () => {
            const response = await request
                .post(url)
                .set("Authorization", authHeader)
                .send({
                    name: "Adele",
                });

            expect(response.status).toBe(201);
            expect(response.body.id).toBeTruthy();
            expect(response.body.name).toBe("Adele");
            artistsToDelete.push(response.body.id);
        });

        testAuthHeader(() => request.post(url));
    });

    describe(`PUT ${url}/:id`, () => {
        beforeAll(async () => {
            // testdata aan db toevoegen
            await knex(tables.artist).insert(data.artists[0]);
        });

        afterAll(async () => {
            // verwijder alle testdata uit db
            await knex(tables.artist)
                .whereIn("id", dataToDelete.artists)
                .delete();
        });

        test("should return 200 and the updated artist", async () => {
            const response = await request
                .put(`${url}/1`)
                .set("Authorization", authHeader)
                .send({
                    name: "Stormzy",
                });
            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                id: 1,
                name: "Stormzy",
            });
        });

        test("should return 404 when updating not existing artist", async () => {
            const response = await request
                .put(`${url}/999`)
                .set("Authorization", authHeader)
                .send({ name: "test" });
            expect(response.status).toBe(404);
            expect(response.body.code).toBe("NOT_FOUND");
            expect(response.body.message).toBe("No artist with id 999 exists");
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
            // testdata aan db toevoegen
            await knex(tables.artist).insert(data.artists[0]);
        });

        test("should return 204", async () => {
            const response = await request
                .delete(`${url}/1`)
                .set("Authorization", authHeader);
            expect(response.status).toBe(204);
        });

        test("should return 404 when deleting not existing artist", async () => {
            const response = await request
                .delete(`${url}/999`)
                .set("Authorization", authHeader);
            expect(response.status).toBe(404);
            expect(response.body.code).toBe("NOT_FOUND");
            expect(response.body.message).toBe("No artist with id 999 exists");
        });

        test("should return 400 with invalid artist id", async () => {
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
