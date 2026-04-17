import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../../src/app.js";
import { expect } from "chai";
import fixtureUtils from "../../fixtures/fixtureUtils.js";
import cryptoUtils from "../../../src/infrastructure/security/cryptoUtils.js";




describe("Functional countLikes test: get /api/post/:postId ", () => {
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
    it("verifica la leggibilità del numero di like di un post", async () => { 
      const {newPostPayload, existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload({}, {status: "published"});

      const resLike = await request(app) 
      .patch("/api/post/" + existingPost._id + "/like") 
      .set("Authorization", `Bearer ${token}`)

      const res = await request(app) 
      .get("/api/post/" + existingPost._id) 

      const postsInDB = await fixtureUtils.getPosts();
      expect(res.body.data.likesCount).to.equal(postsInDB[0].likesCount);      

    });
  });
    
});


