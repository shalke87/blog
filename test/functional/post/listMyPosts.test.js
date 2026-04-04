import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../../src/app.js";
import { expect } from "chai";
import fixtureUtils from "../../fixtures/fixtureUtils.js";
import cryptoUtils from "../../../src/infrastructure/security/cryptoUtils.js";
import config from "../../../config/config.js";




describe("Functional list my posts test: GET /post/listMine ", () => {
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

  describe("GET /post/listMine success", () => {
    it("legge tutti i post di un utente loggato", async () => { 
      const {existingPost, userStored, token} = await fixtureUtils.createPostWithAuthorAndPayload({}, {status: config.POST_STATUS.PUBLISHED});
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
      const posts = [];
      posts.push(post2);
      posts.push(post3);
      posts.push(existingPost);

      const res = await request(app) 
      .get("/post/listMine")
      .set("Authorization", `Bearer ${token}`);
      
      expect(res.status).to.equal(200);
      res.body.data.forEach(post => {
        expect(post.author._id.toString()).to.equal(userStored._id.toString());
        expect(post.title).to.be.oneOf(posts.map(p => p.title));
      });
      expect(res.body.data).to.have.lengthOf(3);
    });

    it("lancia listMine - 0 contenuti - array vuoto", async () => { 

      const {existingPost, userStored, token} = await fixtureUtils.createPostWithAuthorAndPayload({}, {
        title: "titolo test", 
        content: "<p>Contenuto del post.</p>", 
        status: config.POST_STATUS.DRAFT
      });
      
      const res = await request(app) 
      .get("/post/listMine")
      .set("Authorization", `Bearer ${token}`);
      

      expect(res.status).to.equal(200);
      expect(res.body.data[0].title).to.deep.equal(existingPost.title);
      expect(res.body.data[0].content).to.deep.equal(existingPost.content);
      expect(res.body.data[0].status).to.deep.equal(existingPost.status);
      expect(res.body.data).to.have.lengthOf(1);
    });

  });

  describe("GET /post/read/:postId success", () => {
    it("lancia listMine utente non loggato - 401", async () => { 

      const {existingPost, userStored, token} = await fixtureUtils.createPostWithAuthorAndPayload({}, {
        title: "titolo test", 
        content: "<p>Contenuto del post.</p>", 
        status: config.POST_STATUS.DRAFT
      });
      
      const res = await request(app) 
      .get("/post/listMine")
          

      expect(res.status).to.equal(401);
      expect(res.body.message).to.equal("Missing or invalid token");
    });
    
  });
});


