import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../../src/app.js";
import { expect } from "chai";
import fixtureUtils from "../../fixtures/fixtureUtils.js";
import cryptoUtils from "../../../src/infrastructure/security/cryptoUtils.js";
const { ObjectId } = mongoose.Types;




describe("Functional delete a comment test: DELETE /post/:postId/comment/:commentId ", () => {
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

  describe("DELETE /post/:postId/comment/:commentId success", () => {  
    it("elimina un commento e restituisce 200", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();
     
      
      const res = await request(app) 
      .delete("/post/" + existingPost._id + "/comment"+ "/" + existingPost.comments[0]._id) 
      .set("Authorization", `Bearer ${token}`)        
      

      console.log("Response body:", res.body);
      expect(res.status).to.equal(200);
      expect(res.body.comments).to.be.an("array").that.has.lengthOf(0);
    });
  });

  describe("DELETE /post/:postId/comment failure - validation tests", () => {
    it("id non validi, restituisce 400", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();
     
      
      const res = await request(app) 
      .delete("/post/" + "id non valido" + "/comment"+ "/" + "altro id non valido") 
      .set("Authorization", `Bearer ${token}`)        
      .send({ text: "Questa è una modifica del commento." });

      console.log("Response body:", res.body);
      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('"postId" must only contain hexadecimal characters. "postId" length must be 24 characters long. "commentId" must only contain hexadecimal characters. "commentId" length must be 24 characters long');
    });

    it("postId formalmente valido ma inesistente", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();
     
      
      const res = await request(app) 
      .delete("/post/" + new ObjectId().toString() + "/comment"+ "/" + existingPost.comments[0]._id) 
      .set("Authorization", `Bearer ${token}`)        
      .send({ text: "Questa è una modifica del commento." });

      console.log("Response body:", res.body);
      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal('Resource not found');
    });

    it("commentId formalmente valido ma inesistente", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();
     
      
      const res = await request(app) 
      .delete("/post/" + existingPost._id + "/comment"+ "/" + new ObjectId().toString()) 
      .set("Authorization", `Bearer ${token}`)        
    

      console.log("Response body:", res.body);
      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal('Resource not found');
    });
    
  });

  describe("DELETE /post/:postId/comment failure - authorization tests", () => {
    it("nessun token", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();
     
      const res = await request(app) 
      .delete("/post/" + existingPost._id + "/comment"+ "/" + new ObjectId().toString())     

      console.log("Response body:", res.body);
      expect(res.status).to.equal(401);
      expect(res.body.message).to.equal('Missing or invalid token');
    });

    it("token non valido", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();
     
      const res = await request(app) 
      .delete("/post/" + existingPost._id + "/comment"+ "/" + new ObjectId().toString())     
      .set("Authorization", `Bearer ${cryptoUtils.generateRandomToken(16)}`)

      console.log("Response body:", res.body);
      expect(res.status).to.equal(401);
      expect(res.body.message).to.equal('Missing or invalid token');
    });

    it("user non proprietario del commento", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();
      const user2 = await fixtureUtils.createUser();
     
      const res = await request(app) 
      .delete("/post/" + existingPost._id + "/comment"+ "/" + existingPost.comments[0]._id)     
      .set("Authorization", `Bearer ${cryptoUtils.generateJWT({ userId: user2._id.toString() })}`)

      console.log("Response body:", res.body);
      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal('Resource not found');
    });

  });

  

});

