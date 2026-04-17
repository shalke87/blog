import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../../src/app.js";
import { expect } from "chai";
import fixtureUtils from "../../fixtures/fixtureUtils.js";
import cryptoUtils from "../../../src/infrastructure/security/cryptoUtils.js";




describe("Functional delete avatar test: DELETE /user/deleteAvatar ", () => {
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

  describe("DELETE /user/deleteAvatar success", () => {
    it("cancella un avatar e restituisce 200", async () => { 
      const userToStore = {
          username: "testuser",
          email: "test@example.com",
          password: "Password01!",
          avatarURL: "/uploads/avatars/test_avatar.png"
        };
      const userStored = await fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria
      const token = cryptoUtils.generateJWT({ userId: userStored._id.toString() }); //genera un token per l'utente
      
      
      const res = await request(app) 
      .delete("/api/user/deleteAvatar") 
      .set("Authorization", `Bearer ${token}`) 

      console.log("res.body:", res.body); 
      expect(res.status).to.equal(200);
      expect(res.body.avatarURL).to.equal(null);
    });
  });
    
});


