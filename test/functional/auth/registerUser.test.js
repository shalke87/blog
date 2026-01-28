import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../../src/app.js";
import UserModel from "../../../src/infrastructure/database/mongoose/models/userModel.js";
import { expect } from "chai";
import fixtureUtils from "../../fixtures/fixtureUtils.js";

describe("Functional test: POST /auth/register con DB mockato in-memory", () => {
  let mongo;
  // Avvio del DB in-memory + connessione Mongoose
  before(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    await mongoose.connect(uri);
  });

  // Pulizia del DB prima di ogni test
  beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  });

  // Disconnessione e chiusura del DB
  after(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });

  describe("POST /auth/register success", () => {
    it("dovrebbe salvare l'utente nel DB mockato e restituire 201, senza restituire la password", async () => {
        const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "Password01!"
        };

        const res = await request(app)
        .post("/auth/register")
        .send(userData)

        // Verifica risposta
        expect(res.status).to.equal(201);
        expect(res.body).to.have.property("_id");
        expect(res.body.email).to.equal("test@example.com");
        expect(res.body).to.have.property("username", "testuser");
        expect(res.body).to.not.have.property("password");

        // Verifica che l'utente sia davvero nel DB
        const userInDb = await UserModel.findOne({ email: "test@example.com" });

        expect(userInDb).to.not.be.null;
        expect(userInDb.username).to.equal("testuser");
    });
  });

  describe("POST /auth/register failure", () => {
    it("dovrebbe restituire un errore 409 se l'utente esiste già", async () => {
        const userData = {
        username: "testuser",
        email: "test@example.com",
        password: "Password01!"
        };

        // inserisce l'utente nel DB in-memory
        await fixtureUtils.createUser(userData);

        console.log("Verifico utente creato nel DB in memory:", await UserModel.find({}));

        const res = await request(app)
        .post("/auth/register")
        .send(userData)

        // Verifica risposta
        expect(res.status).to.equal(409);
        expect(res.body.message).to.equal("Username or email already exists");
    });

    it("dovrebbe restituire un errore 400 se email mancante", async () => {
        const userData = {
        username: "testuser",
        // email: "test@example.com",       //email mancante
        password: "Password01!"
        };

        const res = await request(app)
        .post("/auth/register")
        .send(userData)

        // Verifica risposta
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal('"email" is required');
    });

    it("dovrebbe restituire un errore 400 se email non valida", async () => {
        const userData = {
        username: "testuser",
        email: "test@@example.com",       //email formato errato
        password: "Password01!"
        };

        const res = await request(app)
        .post("/auth/register")
        .send(userData)

        // Verifica risposta
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal('"email" must be a valid email');
    });

    it("dovrebbe restituire un errore 400 se password debole", async () => {
        const userData = {
        username: "testuser",
        email: "test@example.com",       
        password: "abc"         //password debole
        };

        const res = await request(app)
        .post("/auth/register")
        .send(userData)

        // Verifica risposta
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal("La password deve contenere almeno 8 caratteri, includere almeno una lettera maiuscola, una minuscola, un numero e un carattere speciale (es. !@#$%^&*).");
    });

    it("dovrebbe restituire un errore 400 se password mancante", async () => {
        const userData = {
        username: "testuser",
        email: "test@example.com",       
        // password mancante
        };

        const res = await request(app)
        .post("/auth/register")
        .send(userData)

        // Verifica risposta
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal('"password" is required');
    });
  });
});
