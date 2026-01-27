import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../src/app.js";
import { expect } from "chai";
import cryptoUtils from "../../src/infrastructure/security/cryptoUtils.js";
import fixtureUtils from "../fixtures/fixtureUtils.js";
import { config } from "dotenv";
import configFile from "../../config/config.js";


describe("Functional login test con rate limiter: POST /auth/login ", () => {
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

  

  describe("POST /auth/login fail", () => {
      
    it("rate limiter - fa 2 tentativi di login falliti e poi blocca il terzo tentativo", async () => {

        const userToStore = {
          email: "test@example.com",
          password: "Password01!"
        };

        const loginData = {        // dati inviati al server
          email: "test@example.com",
          password: "WrongPassword01!"
        };

        await fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria

        const res = [];
        for (let i = 0; i < configFile.RATE_LIMIT.MAX_LOGIN_ATTEMPTS; i++) {
          res[i] = await request(app)
          .post("/auth/login")
          .send(loginData);
        }

        // Verifica risposta oltre max tentativi
        const res2 = await request(app)
        .post("/auth/login")
        .send(loginData);

        
        expect(res2.status).to.equal(429);
        expect(res2.body.message).to.equal("Too many login attempts. Please try again later.");
        expect(res2.body).to.not.have.property("tokenJWT");  
    });
  });

    
});
