import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../../src/app.js";
import { expect } from "chai";
import cryptoUtils from "../../../src/infrastructure/security/cryptoUtils.js";
import fixtureUtils from "../../fixtures/fixtureUtils.js";


describe("Functional test: POST /auth/resetPassword/updatePassword ", () => {
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

  describe("POST /auth/resetPassword/updatePassword success", () => {
    it("invia al server il token e la nuova password, riceve codice 200 ", async () => {
        const resetToken = cryptoUtils.generateRandomToken();
        const hashedToken = cryptoUtils.hashData(resetToken);

        const userToStore = {
          email: "test@example.com",
          resetToken: hashedToken,
          resetTokenExpiration: Date.now() + 3600000, // 1 ora nel futuro
        };

        const userData = {        // dati inviati al server
          token: resetToken,
          newPassword: "NewPassword01!"
        };

        await fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria
        const res = await request(app)
        .patch("/auth/resetPassword/updatePassword")
        .send(userData)

        const updatedUser = (await fixtureUtils.getUsers({email: userToStore.email}))[0]; //restituisce array la voglio il suo unico elemento
        const isPasswordUpdated = cryptoUtils.comparePassword(userData.newPassword, updatedUser.hashedPassword);

        // Verifica risposta
        expect(res.status).to.equal(200);
        expect(res.body.message).to.be.equal("Password updated successfully.");
        expect(isPasswordUpdated).to.be.true; //verifica che la password sia stata effettivamente aggiornata
       

    });
  });

  describe("POST /auth/resetPassword/updatePassword failure", () => {
    it("invia al server il token e la nuova password, riceve codice 401 se token scaduto", async () => {
        const resetToken = cryptoUtils.generateRandomToken();
        const hashedToken = cryptoUtils.hashData(resetToken);

        const userToStore = {
          email: "test@example.com",
          resetToken: hashedToken,
          resetTokenExpiration: Date.now() -1, // expired token
        };

        const userData = {        // dati inviati al server
          token: resetToken,
          newPassword: "NewPassword01!"
        };

        const userInDB = fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria
        const res = await request(app)
        .patch("/auth/resetPassword/updatePassword")
        .send(userData)

        // Verifica risposta
        expect(res.status).to.equal(401);
        expect(res.body.message).to.be.equal("Invalid or expired reset token");

    });
  });

  describe("POST /auth/resetPassword/updatePassword failure", () => {
    it("invia al server il token e la nuova password, riceve codice 400 se codice formalmente invalido ", async () => {
        const resetToken = cryptoUtils.generateRandomToken();
        const hashedToken = cryptoUtils.hashData(resetToken);

        const userToStore = {
          email: "test@example.com",
          resetToken: hashedToken,
          resetTokenExpiration: Date.now() + 3600000, // 1 hour in the future
        };

        const userData = {        // dati inviati al server
          token: resetToken+"wrong", //rendo formalmente errato il token
          newPassword: "NewPassword01!"
        };

        const userInDB = fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria
        const res = await request(app)
        .patch("/auth/resetPassword/updatePassword")
        .send(userData)

        // Verifica risposta
        expect(res.status).to.equal(400);
        expect(res.body.message).to.be.equal('"token" length must be 64 characters long. "token" must only contain hexadecimal characters');

    });
  });

  
});
