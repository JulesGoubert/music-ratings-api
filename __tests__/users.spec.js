const { tables } = require("../src/data");

const { testAuthHeader } = require("./common/auth");
const { login, loginAdmin, withServer } = require("./supertest.setup");

const data = {
    users: [
        {
            id: 3,
            name: "Bob",
            email: "bob@hogent.be",
            password_hash:
                "$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4",
            roles: JSON.stringify(["user", "admin"]),
        },
        {
            id: 4,
            name: "Alice",
            email: "alice@hogent.be",
            password_hash:
                "$argon2id$v=19$m=131072,t=6,p=1$9AMcua9h7va8aUQSEgH/TA$TUFuJ6VPngyGThMBVo3ONOZ5xYfee9J1eNMcA5bSpq4",
            roles: JSON.stringify(["user"]),
        },
    ],
};
const dataToDelete = {
    users: [3, 4],
};

describe("Users", () => {
    let request;
    let knex;
    let authHeader;
    let adminAuthHeader;

    withServer(({ supertest, knex: k }) => {
        request = supertest;
        knex = k;
    });

    const url = "/api/users";

    beforeAll(async () => {
        authHeader = await login(request);
        adminAuthHeader = await loginAdmin(request);
    });

    describe(`GET ${url}`, () => {
        beforeAll(async () => {
            await knex(tables.user).insert(data.users);
        });

        afterAll(async () => {
            await knex(tables.user).whereIn("id", dataToDelete.users).delete();
        });

        test("should return 200 and all users", async () => {
            const response = await request
                .get("/api/users")
                .set("Authorization", adminAuthHeader);
            expect(response.status).toBe(200);
            expect(response.body.count).toBe(4);
            expect(response.body.items[2]).toEqual({
                id: 3,
                name: "Bob",
                email: "bob@hogent.be",
                roles: ["user", "admin"],
            });
            expect(response.body.items[3].name).toBe("Alice");
        });

        test("should return 400 when given an argument", async () => {
            const response = await request
                .get("/api/users?invalid=true")
                .set("Authorization", adminAuthHeader);
            expect(response.status).toBe(400);
            expect(response.body.code).toBe("VALIDATION_FAILED");
        });

        testAuthHeader(() => request.get("/api/users"));
    });

    describe(`GET ${url}/:id`, () => {
        beforeAll(async () => {
            await knex(tables.user).insert(data.users[0]);
        });

        afterAll(async () => {
            await knex(tables.user).whereIn("id", dataToDelete.users).delete();
        });

        test("should return 200 and the requested user", async () => {
            const response = await request
                .get(`${url}/3`)
                .set("Authorization", adminAuthHeader);
            expect(response.status).toBe(200);
            expect(response.body.name).toBe("Bob");
        });

        test("should return 400 with invalid user id", async () => {
            const response = await request
                .get(`${url}/invalid`)
                .set("Authorization", authHeader);
            expect(response.status).toBe(400);
            expect(response.body.code).toBe("VALIDATION_FAILED");
        });

        testAuthHeader(() => request.get(`${url}/3`));
    });

    describe(`POST ${url}/register`, () => {
        const usersToDelete = [];

        afterAll(async () => {
            await knex(tables.user).whereIn("id", usersToDelete).delete();
        });

        test("should return 201 and the registered user", async () => {
            const response = await request.post(`${url}/register`).send({
                name: "Jules",
                email: "jules.user@hogent.be",
                password: "12345678",
            });
            expect(response.status).toBe(200);
            expect(response.body.token).toBeTruthy();
            expect(response.body.user.id).toBeTruthy();
            expect(response.body.user.name).toBe("Jules");

            usersToDelete.push(response.body.user.id);
        });

        test("should return 400 when missing name", async () => {
            const response = await request.post(`${url}/register`).send({
                email: "register@hogent.be",
                password: "12345678",
            });
            expect(response.status).toBe(400);
            expect(response.body.code).toBe("VALIDATION_FAILED");
        });
    });

    describe(`PUT ${url}/:id`, () => {
        beforeAll(async () => {
            await knex(tables.user).insert(data.users[0]);
        });

        afterAll(async () => {
            await knex(tables.user).whereIn("id", dataToDelete.users).delete();
        });

        test("should return 200 and the updated user", async () => {
            const response = await request
                .put(`${url}/3`)
                .set("Authorization", adminAuthHeader)
                .send({ name: "Test" });
            expect(response.status).toBe(200);
            expect(response.body.name).toBe("Test");
        });

        test("should return 403 when not admin", async () => {
            const response = await request
                .put(`${url}/3`)
                .set("Authorization", authHeader)
                .send({ name: "Test" });
            expect(response.status).toBe(403);
            expect(response.body.code).toBe("FORBIDDEN");
        });

        testAuthHeader(() => request.put(`${url}/3`));
    });

    describe(`DELETE ${url}/:id`, () => {
        beforeAll(async () => {
            await knex(tables.user).insert(data.users[0]);
        });

        test("should return 204 and nothing", async () => {
            const response = await request
                .delete(`${url}/3`)
                .set("Authorization", adminAuthHeader);
            expect(response.status).toBe(204);
            expect(response.body).toEqual({});
        });

        test("should return 400 with invalid user id", async () => {
            const response = await request
                .delete(`${url}/invalid`)
                .set("Authorization", adminAuthHeader);
            expect(response.status).toBe(400);
            expect(response.body.code).toBe("VALIDATION_FAILED");
        });

        test("should return 404 with not existing user", async () => {
            const response = await request
                .delete(`${url}/999`)
                .set("Authorization", adminAuthHeader);
            expect(response.status).toBe(404);
            expect(response.body.code).toBe("NOT_FOUND");
        });

        test("should 403 when not admin", async () => {
            const response = await request
                .delete(`${url}/3`)
                .set("Authorization", authHeader);
            expect(response.status).toBe(403);
            expect(response.body.code).toBe("FORBIDDEN");
        });

        testAuthHeader(() => request.delete(`${url}/3`));
    });
});
