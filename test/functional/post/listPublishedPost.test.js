import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../../src/app.js";
import { expect } from "chai";
import fixtureUtils from "../../fixtures/fixtureUtils.js";
import cryptoUtils from "../../../src/infrastructure/security/cryptoUtils.js";
import config from "../../../config/config.js";




describe("Functional list post test: GET /api/post/listPublished ", () => {
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

  describe("GET /api/post/listPublished success", () => {
    it("legge una lista di post pubblicati - utente non loggato", async () => { 
      const {existingPost, userStored} = await fixtureUtils.createPostWithAuthorAndPayload({}, {status: config.POST_STATUS.PUBLISHED});
      const post2 = await fixtureUtils.createPost({
        title: "Secondo post",
        content: "<p>Contenuto del secondo post.</p>",
        author: userStored._id,
        status: config.POST_STATUS.PUBLISHED
      });
      const post3 = await fixtureUtils.createPost({
        title: "Terzo post",
        content: "<p>Contenuto del terzo post.</p>",
        author: userStored._id,
        status: config.POST_STATUS.DRAFT
      });

      const res = await request(app) 
      .get("/api/post/listPublished");
      
      expect(res.status).to.equal(200);
      res.body.data.forEach(post => {
        expect(post.status).to.equal(config.POST_STATUS.PUBLISHED);
        expect(post.title).to.not.equal(post3.title);

      });
      expect(res.body.data).to.have.lengthOf(2);
    });

    it("lancia listPublished - 0 contenuti", async () => { 
      
      const res = await request(app) 
      .get("/api/post/listPublished");
      
      expect(res.status).to.equal(200);
      expect(res.body.data).to.deep.equal([]); //verifico che l'array sia vuoto
      
    });

  });

  describe("GET /api/post/read/:postId failure", () => { 
    
  });
});


