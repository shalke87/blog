import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../src/app.js";
import { expect } from "chai";
import fixtureUtils from "../fixtures/fixtureUtils.js";




describe("Functional login test: POST /auth/login ", () => {
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

  describe("POST /auth/login success", () => {
    it("invia al server email e password, riceve codice 200 ", async () => {

        const userToStore = {
          email: "test@example.com",
          password: "Password01!"
        };

        const loginData = {        // dati inviati al server
          email: userToStore.email,
          password: userToStore.password
        };

        await fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria
        const res = await request(app)
        .post("/auth/login")
        .send(loginData);

        // Verifica risposta
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("tokenJWT");
        expect(res.body.user.email).to.equal(userToStore.email);
       

    });
  });

  describe("POST /auth/login fail", () => {
      it("invia al server email e password, 400 email formalmente errata", async () => {

        const userToStore = {
          email: "test@example.com",
          password: "Password01!"
        };

        const loginData = {        // dati inviati al server
          email: "invalid-email-format",
          password: userToStore.password
        };

        await fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria
        const res = await request(app)
        .post("/auth/login")
        .send(loginData);

        // Verifica risposta
        expect(res.status).to.equal(400);
        expect(res.body).to.not.have.property("tokenJWT");  
        expect(res.body.message).to.equal('"email" must be a valid email');
    });

    it("invia al server email e password, 401 unauthorized - email non registrata", async () => {

        const userToStore = {
          email: "test@example.com",
          password: "Password01!"
        };

        const loginData = {        // dati inviati al server
          email: "test2@example.com",
          password: userToStore.password
        };

        await fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria
        const res = await request(app)
        .post("/auth/login")
        .send(loginData);

        // Verifica risposta
        expect(res.status).to.equal(401);
        expect(res.body).to.not.have.property("tokenJWT");  
        expect(res.body.message).to.equal("Email or password incorrect");
    });

    it("invia al server email e password, 401 unauthorized - password errata", async () => {

        const userToStore = {
          email: "test@example.com",
          password: "Password01!"
        };

        const loginData = {        // dati inviati al server
          email: "test@example.com",
          password: "WrongPassword01!"
        };

        await fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria
        const res = await request(app)
        .post("/auth/login")
        .send(loginData);

        // Verifica risposta
        expect(res.status).to.equal(401);
        expect(res.body).to.not.have.property("tokenJWT");  
        expect(res.body.message).to.equal("Email or password incorrect");
    });

    
  });

    
});
