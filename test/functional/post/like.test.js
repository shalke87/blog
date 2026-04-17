import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../../src/app.js";
import { expect } from "chai";
import fixtureUtils from "../../fixtures/fixtureUtils.js";
import config from "../../../config/config.js";
const { ObjectId } = mongoose.Types;




describe("Functional test for liking a post: PATCH /api/post/:postId/like ", () => {
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

  describe("PATCH /api/post/:postId/like success", () => {
    it("aggiunge un like e restituisce 200", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload({}, {status: config.POST_STATUS.PUBLISHED});
      
      const res = await request(app) 
      .patch("/api/post/" + existingPost._id + "/like") 
      .set("Authorization", `Bearer ${token}`) 

      expect(res.body.liked).to.equal(true);
      expect(res.body.likesCount).to.equal(1);
    });

    it("aggiunge e toglie un like restituisce 200", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload({}, {status: config.POST_STATUS.PUBLISHED});
      
      const res = await request(app) 
      .patch("/api/post/" + existingPost._id + "/like") 
      .set("Authorization", `Bearer ${token}`) 

      const inMemoryPosts = await fixtureUtils.getPosts();
      console.log("In-memory posts after like/unlike:", inMemoryPosts);

      const res2 = await request(app) 
      .patch("/api/post/" + existingPost._id + "/like") 
      .set("Authorization", `Bearer ${token}`) 


      expect(res.body.liked).to.equal(true);
      expect(res.body.likesCount).to.equal(1);
      expect(res2.body.liked).to.equal(false);
      expect(res2.body.likesCount).to.equal(0);
    });
  });


  describe("PATCH /api/post/:postId/like failure", () => {
    
    it("mette like a un post in stato draft - 404", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload({}, {status: config.POST_STATUS.DRAFT});
      
      const res = await request(app) 
      .patch("/api/post/" + existingPost._id + "/like") 
      .set("Authorization", `Bearer ${token}`) 

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property("message");
    }); 

  });

  describe("POST /api/post/:postId/comment failure - authorization tests", () => {
    it("aggiunge un commento - utente non loggato - 401", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();
      
      const res = await request(app) 
      .patch("/api/post/" + existingPost._id + "/like") 
   

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property("message");
    }); 

    it("mette like - post non esiste - 404", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();
      
      const res = await request(app) 
      .patch("/api/post/" + new ObjectId() + "/like") 
      .set("Authorization", `Bearer ${token}`) 

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property("message");
      expect(res.body.message).to.include("not found");
    }); 
  });

  

});

