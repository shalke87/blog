import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../../src/app.js";
import { expect } from "chai";
import fixtureUtils from "../../fixtures/fixtureUtils.js";
import cryptoUtils from "../../../src/infrastructure/security/cryptoUtils.js";




describe("Functional delete post test: DELETE /post/delete/:postId ", () => {
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

  describe("DELETE /post/delete/:postId success", () => {
    it("elimina un post e restituisce 200", async () => { 
      const {newPostPayload, existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();
      
      console.log("Payload del nuovo post:", newPostPayload);

      const res = await request(app) 
      .delete("/post/delete/" + existingPost._id) 
      .set("Authorization", `Bearer ${token}`) 

      const postInDB = await fixtureUtils.getPosts();
      console.log(res.body); 
      expect(res.status).to.equal(200);
      expect(postInDB.length).to.equal(0);
      

    });
  });

  describe("DELETE /post/delete/:postId failure", () => {
    it("prova a eliminare un post senza essere loggato e restituisce 401", async () => { 
      const {newPostPayload, existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();
      
      console.log("Payload del nuovo post:", newPostPayload);

      const res = await request(app) 
      .delete("/post/delete/" + existingPost._id) 

      console.log(res.body); 
      expect(res.status).to.equal(401);
      expect(res.body.message).to.equal("Missing or invalid token");
    });

    it("prova a eliminare un post di un altro utente e restituisce 404: resource not found", async () => { 
      const {newPostPayload, existingPost} = await fixtureUtils.createPostWithAuthorAndPayload();
      const user2 = await fixtureUtils.createUser({
        username: "otheruser",
        email: "otheruser@example.com"
      });
      const tokenUser2 = cryptoUtils.generateJWT({userId: user2._id.toString()});
      
      console.log("Payload del nuovo post:", newPostPayload);

      const res = await request(app) 
      .delete("/post/delete/" + existingPost._id) 
      .set("Authorization", `Bearer ${tokenUser2}`);
      console.log(res.body); 

      const postInDB = await fixtureUtils.getPosts();
      console.log("Posts in DB after unauthorized delete attempt:", postInDB);

      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal("Resource not found");
    });

    it("prova a eliminare un post inviando id mal formato e restituisce 400: bad request", async () => { 
      const {newPostPayload, existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();
      
      console.log("Payload del nuovo post:", newPostPayload);

      const res = await request(app) 
      .delete("/post/delete/" + "malformedId123") 
      .set("Authorization", `Bearer ${token}`);
      console.log(res.body); 

      const postInDB = await fixtureUtils.getPosts();
      console.log("Posts in DB after unauthorized delete attempt:", postInDB);

      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('"postId" must only contain hexadecimal characters. "postId" length must be 24 characters long');
    });

  });

    
});


