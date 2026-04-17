import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../../src/app.js";
import { expect } from "chai";
import cryptoUtils from "../../../src/infrastructure/security/cryptoUtils.js";
import fixtureUtils from "../../fixtures/fixtureUtils.js";
import authConfig from "../../../config/authConfig.js";
import { verifyEmailRateLimiter } from "../../../src/api/middlewares/verifyEmailRateLimiter.js";


describe("Functional verify email test con rate limiter: GET /api/auth/verifyEmail ", () => {
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

  

  describe("GET /api/auth/verifyEmail fail", () => {
      
    it("rate limiter - fa MAX_EMAIL_VERIFICATION_ATTEMPTS tentativi di verifica email falliti e poi blocca il terzo tentativo", async () => {

        const userToStore = {
          email: "test@example.com",
          password: "Password01!",
          emailVerificationToken: cryptoUtils.hashData("dummy-verification-token"), // token di verifica fittizio
          emailVerificationTokenExpiration: new Date(Date.now() + 3600000) // token valido per 1 ora
        };

        const verifyEmailData = {        // dati inviati al server
          token: "invalid-verification-token" // token di verifica fittizio
        };

        await fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria

        // Pausa per assicurarsi che il reset sia effettivo
        await new Promise(resolve => setTimeout(resolve, 100));

        const res = [];
        console.log(`Max verify email attempts: ${authConfig.RATE_LIMIT.MAX_EMAIL_VERIFICATION_ATTEMPTS}`);
        for (let i = 0; i < authConfig.RATE_LIMIT.MAX_EMAIL_VERIFICATION_ATTEMPTS; i++) {
          res[i] = await request(app)
          .get(`/api/auth/verifyEmail?token=${verifyEmailData.token}`);
          console.log(`Tentativo ${i + 1}: Status ${res[i].status}, Remaining: ${res[i].headers['ratelimit-remaining']}`);
        }

        // Verifica risposta oltre max tentativi
        const res2 = await request(app)
        .get(`/api/auth/verifyEmail?token=${verifyEmailData.token}`);

        
        expect(res2.status).to.equal(429);
        expect(res2.body.message).to.equal("Too many email verification attempts. Please try again later.");
        expect(res2.body).to.not.have.property("tokenJWT");  
    });
  });

  

    
});
