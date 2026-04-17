import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../../src/app.js";
import { expect } from "chai";
import cryptoUtils from "../../../src/infrastructure/security/cryptoUtils.js";
import fixtureUtils from "../../fixtures/fixtureUtils.js";
import { config } from "dotenv";
import configFile from "../../../config/config.js";


describe("Functional updateUsername test: POST /auth/updateUsername ", () => {
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

  describe("POST /user/updateUsername success", () => {
    it("invia al server il nuovo username, rispondi con oggetto user aggiornato e codice 200 ", async () => {

        const userToStore = {
          username: "oldUsername",
          email: "test@example.com",
          password: "Password01!"
        };
        const userStored = await fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria
        console.log("User stored:", userStored);
        console.log("User ID:", userStored._id);
        const tokenJWT = cryptoUtils.generateJWT({ userId: userStored._id }); //genera un token per simulare l'autenticazione

        const newUsername = "newUsername";
        const res = await request(app)
        .patch("/api/user/updateUsername")
        .set("Authorization", `Bearer ${tokenJWT}`)
        .send({ username: newUsername });


        // Verifica risposta
        expect(res.status).to.equal(200);
        expect(res.body.email).to.equal(userToStore.email);
        expect(res.body.username).to.equal(newUsername);
    });
  });

  describe("POST /user/updateUsername fail", () => {
      it("invia al server il nuovo username, fallisci se token formalmente non valido", async () => {

        const userToStore = {
          username: "oldUsername",
          email: "test@example.com",
          password: "Password01!"
        };
   
        const userStored = await fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria
        console.log("User stored:", userStored);
        console.log("User ID:", userStored._id);
        const tokenJWT = cryptoUtils.generateJWT({ userId: userStored._id}) + "invalid"; //genera un token diverso per far fallire l'autenticazione

        const newUsername = "newUsername";
        const res = await request(app)
        .patch("/api/user/updateUsername")
        .set("Authorization", `Bearer ${tokenJWT}`)
        .send({ username: newUsername });


        // Verifica risposta
        expect(res.status).to.equal(401);
        expect(res.body.message).to.equal("Missing or invalid token");
        expect(res.body.userData).to.be.undefined;
    });

    it("invia al server il nuovo username, formalmente errato, fallisce", async () => {

        const userToStore = {
          username: "oldUsername",
          email: "test@example.com",
          password: "Password01!"
        };
   
        const userStored = await fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria

        const tokenJWT = cryptoUtils.generateJWT({ userId: userStored._id}); //genera un token diverso per far fallire l'autenticazione

        const newUsername = "ab"; //username troppo corto
        const res = await request(app)
        .patch("/api/user/updateUsername")
        .set("Authorization", `Bearer ${tokenJWT}`)
        .send({ username: newUsername });

        // Verifica risposta
        expect(res.status).to.equal(400);
        expect(res.body.message).to.equal('"username" length must be at least 3 characters long');
        expect(res.body.userData).to.be.undefined;
    });
  });

    
});
