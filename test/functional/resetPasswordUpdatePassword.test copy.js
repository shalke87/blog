import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../src/app.js";
import { expect } from "chai";
import cryptoUtils from "../../src/infrastructure/security/cryptoUtils.js";
import fixtureUtils from "../fixtures/fixtureUtils.js";


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
    it("invia al server il token e la nuova password, riceve codice 204 ", async () => {
        const resetToken = cryptoUtils.generateRandomToken();
        const hashedToken = cryptoUtils.hashData(resetToken);

        const userToStore = {
          email: "test@example.com",
          resetToken: hashedToken,
          resetTokenExpiration: Date.now() + 3600000, // 1 ora nel futuro
        };

        const userData = {        // dati inviati al server
          resetToken,
          newPassword: "NewPassword01!"
        };

        const userInDB = fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria
        const res = await request(app)
        .post("/auth/resetPassword/updatePassword")
        .send(userData)

        // Verifica risposta
        expect(res.status).to.equal(204);
        expect(res.body.message).to.be.equal("Password updated successfully.");

    });
  });

  
});
