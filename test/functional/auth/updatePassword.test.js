import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../../src/app.js";
import { expect } from "chai";
import cryptoUtils from "../../../src/infrastructure/security/cryptoUtils.js";
import fixtureUtils from "../../fixtures/fixtureUtils.js";


describe("Functional test: PATCH /api/auth/updatePassword ", () => {
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

  describe("PATCH /auth/updatePassword success", () => {
    it("invia al server vecchia e nuova password, riceve codice 200 ", async () => {

        const userToStore = {
          email: "test@example.com",
          password: "OldPassword01!"
        };

        const userData = {        // dati inviati al server
          oldPassword: "OldPassword01!",
          newPassword: "NewPassword01!"
        };
        const userStored = await fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria
        const token = cryptoUtils.generateJWT({ userId: userStored._id.toString() }); //genera un token per l'utente

        const res = await request(app)
        .patch("/api/auth/updatePassword")
        .send(userData)
        .set("Authorization", `Bearer ${token}`) //autentico la richiesta con un token valido

        const updatedUser = (await fixtureUtils.getUsers({email: userToStore.email}))[0]; //restituisce array la voglio il suo unico elemento
        const isPasswordUpdated = cryptoUtils.comparePassword(userData.newPassword, updatedUser.hashedPassword);

        // Verifica risposta
        expect(res.status).to.equal(200);
        expect(res.body.message).to.be.equal("Password updated successfully.");
        expect(isPasswordUpdated).to.be.true; //verifica che la password sia stata effettivamente aggiornata
       

    });
  });

  describe("PATCH /auth/updatePassword failure", () => {
    it("invia al server vecchia e nuova password, riceve codice 401 se jwt non valido ", async () => {
      
       const userToStore = {
          email: "test@example.com",
          password: "OldPassword01!"
        };

        const userData = {        // dati inviati al server
          oldPassword: "OldPassword01!",
          newPassword: "NewPassword01!"
        };
        const userStored = await fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria
        const token = cryptoUtils.generateJWT({ userId: userStored._id.toString() }); //genera un token per l'utente

        const res = await request(app)
        .patch("/api/auth/updatePassword")
        .send(userData)
        .set("Authorization", `Bearer ${token+"wrong"}`) //autentico la richiesta con un token non valido

        const updatedUser = (await fixtureUtils.getUsers({email: userToStore.email}))[0]; //restituisce array la voglio il suo unico elemento
        const isPasswordUpdated = cryptoUtils.comparePassword(userData.newPassword, updatedUser.hashedPassword);

        // Verifica risposta
        expect(res.status).to.equal(401);
        expect(res.body.message).to.be.equal("Missing or invalid token");
        expect(isPasswordUpdated).to.be.false; //verifica che la password non sia stata aggiornata

    });

    it("invia al server vecchia e nuova password, riceve codice 401 se vecchia password non corretta ", async () => {
      
       const userToStore = {
          email: "test@example.com",
          password: "OldPassword01!"
        };

        const userData = {        // dati inviati al server
          oldPassword: "WrongOldPassword01!",
          newPassword: "NewPassword01!"
        };
        const userStored = await fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria
        const token = cryptoUtils.generateJWT({ userId: userStored._id.toString() }); //genera un token per l'utente

        const res = await request(app)
        .patch("/api/auth/updatePassword")
        .send(userData)
        .set("Authorization", `Bearer ${token}`) //autentico la richiesta con un token non valido

        const updatedUser = (await fixtureUtils.getUsers({email: userToStore.email}))[0]; //restituisce array la voglio il suo unico elemento
        const isPasswordUpdated = cryptoUtils.comparePassword(userData.newPassword, updatedUser.hashedPassword);

        // Verifica risposta
        expect(res.status).to.equal(400);
        expect(res.body.message).to.be.equal("Old password is incorrect");
        expect(isPasswordUpdated).to.be.false; //verifica che la password non sia stata aggiornata

    });
  });

  
});
