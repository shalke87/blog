import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../../src/app.js";
import { expect } from "chai";
import fixtureUtils from "../../fixtures/fixtureUtils.js";
import cryptoUtils from "../../../src/infrastructure/security/cryptoUtils.js";
import config from "../../../config/config.js";




describe("Functional read post test: GET /post/:postId ", () => {
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

  describe("GET /post/:postId success", () => {
    it("legge un post e restituisce 200 - e contenuto corretto - utente non loggato", async () => { 
      const {existingPost} = await fixtureUtils.createPostWithAuthorAndPayload({}, {status: config.POST_STATUS.PUBLISHED});
    

      const res = await request(app) 
      .get("/post/" + existingPost._id);

      console.log(res.body); 
      expect(res.status).to.equal(200);
      expect(res.body.data.title).to.equal(existingPost.title);
      expect(res.body.data.content).to.equal(existingPost.content);
      expect(res.body.data.status).to.equal(config.POST_STATUS.PUBLISHED);   
    });

  });

  describe("GET /post/:postId failure", () => {
    it("prova a leggere una draft con utente non loggato", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload({}, {status: config.POST_STATUS.DRAFT});
      
      const res = await request(app) 
      .get("/post/" + existingPost._id);

      console.log("posto letto:", res.body); 
      expect(res.status).to.equal(404); //perché il post è in draft
    });

    it("lettura post inesistente", async () => { 

      const res = await request(app) 
      .get("/post/" + new mongoose.Types.ObjectId().toString());
      console.log("posto letto:", res.body); 
      expect(res.status).to.equal(404); //perché il post è in draft
    });

    it("Post in bozza, utente loggato ma NON autore", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload({}, {status: config.POST_STATUS.DRAFT});
      const user2 = await fixtureUtils.createUser({username: "otheruser", email: "otheruser@example.com"});
      const token2 = cryptoUtils.generateJWT({ userId: user2._id.toString() });
      
      const res = await request(app) 
      .get("/post/" + existingPost._id)
      .set("Authorization", `Bearer ${token2}`);

      console.log("posto letto:", res.body); 
      expect(res.status).to.equal(404); //perché il post è in draft e non è suo
    });
  });
});


