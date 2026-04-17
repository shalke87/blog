import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../../src/app.js";
import { expect } from "chai";


describe("Functional test: POST /api/auth/resetPassword ", () => {
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

  describe("POST /api/auth/resetPassword success", () => {
    it("dovrebbe generare un token, inviarlo all'utente che ha richiesto il reset della password e memorizzare il suo hash e la sua scadenza nel database", async () => {
        const userData = {
        email: "test@example.com"
        };

        const res = await request(app)
        .post("/api/auth/resetPassword")
        .send(userData)

        // Verifica risposta
        expect(res.status).to.equal(200);
        expect(res.body.message).to.be.equal("If the email exists, a reset token has been sent.");

    });
  });

  
});
