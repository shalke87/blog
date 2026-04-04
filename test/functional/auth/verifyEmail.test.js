import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../../src/app.js";
import { expect } from "chai";
import fixtureUtils from "../../fixtures/fixtureUtils.js";
import cryptoUtils from "../../../src/infrastructure/security/cryptoUtils.js";
import { verifyEmailRateLimiter } from "../../../src/api/middlewares/verifyEmailRateLimiter.js";




describe("Functional verify email test: POST /auth/verifyEmail ", () => {
  let mongo;
  // Avvio del DB in-memory + connessione Mongoose
  before(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    await mongoose.connect(uri);
    app.set("trust proxy", true); // Imposta trust proxy per i test
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

  describe("GET /auth/verifyEmail success", () => {
    it("invia al server email e token di verifica, riceve codice 200 ", async () => {
        const hashedVerifictionToken = cryptoUtils.hashData("dummy-verification-token");
        const userToStore = {
          email: "test@example.com",
          password: "Password01!",
          status: "pending", // per assicurarsi che l'utente sia in attesa di verifica
          emailVerificationToken: hashedVerifictionToken, // token di verifica fittizio
          emailVerificationTokenExpiration: new Date(Date.now() + 3600000) // token valido per 1 ora
        };

        const verifyEmailData = {        // dati inviati al server
          token: "dummy-verification-token" // token di verifica fittizio
        };

        await fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria
        
        const res = await request(app)
        .get(`/auth/verifyEmail?token=${verifyEmailData.token}`)
        .set("X-Forwarded-For", "9.9.9.9"); // Imposta un IP fittizio per evitare problemi con il rate limiter durante i test

        // Verifica risposta
        expect(res.status).to.equal(200);
        expect(res.body.user.status).to.equal("active");
        expect(res.body.user.email).to.equal(userToStore.email);
        expect(res.body.user.emailVerificationToken).to.be.null;
        expect(res.body.user.emailVerificationTokenExpiration).to.be.null;
    });
  });

  describe("GET /auth/verifyEmail fail", () => {
      it("il server riceve token di verifica scaduto", async () => {

        const userToStore = {
          email: "test@example.com",
          password: "Password01!",
          status: "pending", // per assicurarsi che l'utente sia in attesa di verifica
          emailVerificationToken: cryptoUtils.hashData("dummy-verification-token"), // token di verifica fittizio
          emailVerificationTokenExpiration: new Date(Date.now() - 3600000) // token scaduto
        };

        const verifyEmailData = {        // dati inviati al server
          token: "dummy-verification-token" // token di verifica fittizio
        };

        await fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria
        const res = await request(app)
        .get(`/auth/verifyEmail?token=${verifyEmailData.token}`)
        .set("X-Forwarded-For", "9.9.9.9"); // Imposta un IP fittizio per evitare problemi con il rate limiter durante i test

        // Verifica risposta
        expect(res.status).to.equal(400);
        expect(res.body).to.not.have.property("tokenJWT");  
        expect(res.body.message).to.equal("Invalid or expired verification token");
      });
    
      it("il server riceve token di verifica non valido", async () => {

        const userToStore = {
          email: "test@example.com",
          password: "Password01!",
          status: "pending", // per assicurarsi che l'utente sia in attesa di verifica
          emailVerificationToken: cryptoUtils.hashData("dummy-verification-token"), // token di verifica fittizio
          emailVerificationTokenExpiration: new Date(Date.now() - 3600000) // token scaduto
        };

        const verifyEmailData = {        // dati inviati al server
          token: "invalid-verification-token" // token di verifica non valido
        };

        await fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria
        const res = await request(app)
        .get(`/auth/verifyEmail?token=${verifyEmailData.token}`)
        .set("X-Forwarded-For", "9.9.9.9"); // Imposta un IP fittizio per evitare problemi con il rate limiter durante i test

        // Verifica risposta
        expect(res.status).to.equal(400);
        expect(res.body).to.not.have.property("tokenJWT");  
        expect(res.body.message).to.equal("Invalid or expired verification token");
      });
      
    
  });

    
});
