import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../../src/app.js";
import { expect } from "chai";
import fixtureUtils from "../../fixtures/fixtureUtils.js";
import cryptoUtils from "../../../src/infrastructure/security/cryptoUtils.js";
const { ObjectId } = mongoose.Types;




describe("Functional update a comment test: PATCH /post/:postId/comment/:commentId ", () => {
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

  describe("PATCH /post/:postId/comment/:commentId success", () => {  
    it("modifica un commento e restituisce 200", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();
     
      
      const res = await request(app) 
      .patch("/post/" + existingPost._id + "/comment"+ "/" + existingPost.comments[0]._id) 
      .set("Authorization", `Bearer ${token}`)        
      .send({ text: "Questa è una modifica del commento." });

      console.log("Response body:", res.body);
      expect(res.status).to.equal(200);
      expect(res.body.comments).to.be.an("array").that.has.lengthOf(1);
      expect(res.body.comments[0].text).to.equal("Questa è una modifica del commento.");    
    });
  });

  describe("PATCH /post/:postId/comment failure - validation tests", () => {
    it("id non validi, restituisce 400", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();
     
      
      const res = await request(app) 
      .patch("/post/" + "id non valido" + "/comment"+ "/" + "altro id non valido") 
      .set("Authorization", `Bearer ${token}`)        
      .send({ text: "Questa è una modifica del commento." });

      console.log("Response body:", res.body);
      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('"postId" must only contain hexadecimal characters. "postId" length must be 24 characters long. "commentId" must only contain hexadecimal characters. "commentId" length must be 24 characters long');
    });

    it("postId valido ma inesistente", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();
     
      
      const res = await request(app) 
      .patch("/post/" + new ObjectId().toString() + "/comment"+ "/" + existingPost.comments[0]._id) 
      .set("Authorization", `Bearer ${token}`)        
      .send({ text: "Questa è una modifica del commento." });

      console.log("Response body:", res.body);
      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal('Resource not found');
    });

    it("commentId valido ma inesistente", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();
     
      
      const res = await request(app) 
      .patch("/post/" + existingPost._id + "/comment"+ "/" + new ObjectId().toString()) 
      .set("Authorization", `Bearer ${token}`)        
      .send({ text: "Questa è una modifica del commento." });

      console.log("Response body:", res.body);
      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal('Resource not found');
    });

    it("modifica un commento, body mancante", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();
     
      
      const res = await request(app) 
      .patch("/post/" + existingPost._id + "/comment"+ "/" + new ObjectId().toString()) 
      .set("Authorization", `Bearer ${token}`)        
      

      console.log("Response body:", res.body);
      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('"value" is required');
    });

    it("modifica un commento, body contenente stringa vuota", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();
     
      
      const res = await request(app) 
      .patch("/post/" + existingPost._id + "/comment"+ "/" + new ObjectId().toString()) 
      .set("Authorization", `Bearer ${token}`)        
      .send({ text: "" });

      console.log("Response body:", res.body);
      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('"text" is not allowed to be empty');
    });

    it("modifica un commento, body contiene campi extra", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();
     
      
      const res = await request(app) 
      .patch("/post/" + existingPost._id + "/comment"+ "/" + new ObjectId().toString()) 
      .set("Authorization", `Bearer ${token}`)        
      .send({ text: "un commento corretto", extraField: "extraValue" });

      console.log("Response body:", res.body);
      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('"extraField" is not allowed');
    });
    
  });

  describe("PATCH /post/:postId/comment failure - authorization tests", () => {
    it("nessun token", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();
     
      const res = await request(app) 
      .patch("/post/" + existingPost._id + "/comment"+ "/" + new ObjectId().toString())     
      .send({ text: "un commento corretto"});

      console.log("Response body:", res.body);
      expect(res.status).to.equal(401);
      expect(res.body.message).to.equal('Missing or invalid token');
    });

    it("token non valido", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();
     
      const res = await request(app) 
      .patch("/post/" + existingPost._id + "/comment"+ "/" + new ObjectId().toString())     
      .set("Authorization", `Bearer ${cryptoUtils.generateRandomToken(16)}`)
      .send({ text: "un commento corretto"});

      console.log("Response body:", res.body);
      expect(res.status).to.equal(401);
      expect(res.body.message).to.equal('Missing or invalid token');
    });

    it("user non proprietario del commento", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();
      const user2 = await fixtureUtils.createUser();
     
      const res = await request(app) 
      .patch("/post/" + existingPost._id + "/comment"+ "/" + existingPost.comments[0]._id)     
      .set("Authorization", `Bearer ${cryptoUtils.generateJWT({ userId: user2._id.toString() })}`)
      .send({ text: "un commento corretto"});

      console.log("Response body:", res.body);
      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal('Resource not found');
    });

  });

  

});

