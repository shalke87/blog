import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../../src/app.js";
import UserModel from "../../../src/infrastructure/database/mongoose/models/userModel.js";
import { expect } from "chai";
import fixtureUtils from "../../fixtures/fixtureUtils.js";
import cryptoUtils from "../../../src/infrastructure/security/cryptoUtils.js";


describe("Functional test: POST /auth/resetPassword/confirm ", () => {
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

  describe("GET /auth/resetPassword/confirm success", () => {
    it("riceve il token tramite get, cerca il suo hash nel DB e notifica il FE se ok", async () => {

        const resetToken = cryptoUtils.generateRandomToken();
        const hashedToken = cryptoUtils.hashData(resetToken);
       
        const userData = {
          email: "test@example.com",
          resetToken: hashedToken,
          resetTokenExpiration: Date.now() + 3600000 // 1 ora nel futuro
        };

        await fixtureUtils.createUser(userData);  //inserisce un utente nel DB in memoria

        const res = await request(app)      //invia il token precedentemente ricevuto via email
        .get("/auth/resetPassword/confirm")
        .query({ token: resetToken });

        console.log("nel db in memory:", await UserModel.find({}));
        // Verifica risposta
        expect(res.status).to.equal(200);
        expect(res.body.message).to.be.equal("Valid reset token");
        expect(res.body.email).to.be.equal(userData.email);

    }); 
  });

  describe("GET /auth/resetPassword/confirm failure", () => {
    it("riceve il token tramite get, cerca il suo hash nel DB ma è scaduto", async () => {

        const resetToken = cryptoUtils.generateRandomToken();
        const hashedToken = cryptoUtils.hashData(resetToken);
       
        const userData = {
          email: "test@example.com",
          resetToken: hashedToken,
          resetTokenExpiration: Date.now() -1 // scaduto da un millisec
        };

        await fixtureUtils.createUser(userData);  //inserisce un utente nel DB in memoria

        const res = await request(app)      //invia il token scaduto
        .get("/auth/resetPassword/confirm")
        .query({ token: resetToken });

        console.log("verifico res.body per privacy:", res.body);
        // Verifica risposta
        expect(res.status).to.equal(401);
        expect(res.body.message).to.be.equal("Invalid or expired reset token");
        expect(res.body).to.deep.equal({ status: 401, message: 'Invalid or expired reset token' }); // verifica che non venga restituito altri dati

    });

    it("riceve il token tramite get, cerca il suo hash nel DB ma la sintassi è errata", async () => {

        const resetToken = cryptoUtils.generateRandomToken();
        const hashedToken = cryptoUtils.hashData(resetToken);
       
        const userData = {
          email: "test@example.com",
          resetToken: hashedToken,
          resetTokenExpiration: Date.now() + 3600000 // 1 ora nel futuro
        };

        await fixtureUtils.createUser(userData);  //inserisce un utente nel DB in memoria

        const res = await request(app)      //invia il token scaduto
        .get("/auth/resetPassword/confirm")
        .query({ token: resetToken + "wrong" }); //rendo errato il token

      
        // Verifica risposta
        const expectedMessage = '"token" length must be 64 characters long. "token" must only contain hexadecimal characters';
        expect(res.status).to.equal(400);
        expect(res.body.message).to.be.equal(expectedMessage);

    });

    it("riceve il token tramite get, cerca il suo hash nel DB ma è diverso", async () => {

        const resetToken = cryptoUtils.generateRandomToken();
        const hashedToken = cryptoUtils.hashData(resetToken);
       
        const userData = {
          email: "test@example.com",
          resetToken: hashedToken,
          resetTokenExpiration: Date.now() + 3600000 // 1 ora nel futuro
        };

        await fixtureUtils.createUser(userData);  //inserisce un utente nel DB in memoria
        const wrongToken = cryptoUtils.generateRandomToken(); //genero un token completamente diverso

        const res = await request(app)      //invia il token scaduto
        .get("/auth/resetPassword/confirm")
        .query({ token: wrongToken }); //rendo errato il token

        // Verifica risposta
        const expectedMessage = "Invalid or expired reset token";
        expect(res.status).to.equal(401);
        expect(res.body.message).to.be.equal(expectedMessage);

    });
  });

  
});
