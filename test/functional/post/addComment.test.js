import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../../src/app.js";
import { expect } from "chai";
import fixtureUtils from "../../fixtures/fixtureUtils.js";
import cryptoUtils from "../../../src/infrastructure/security/cryptoUtils.js";
const { ObjectId } = mongoose.Types;




describe("Functional add a comment test: POST /post/:postId/comment ", () => {
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

  describe("POST /post/:postId/comment success", () => {
    it("aggiunge un commento e restituisce 200", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();
      
      const res = await request(app) 
      .post("/post/" + existingPost._id + "/comment") 
      .set("Authorization", `Bearer ${token}`) 
      .send({ text: "Questo è un commento di test." });

      expect(res.status).to.equal(200);
      expect(res.body.comments).to.be.an("array").that.has.lengthOf(2); //un commento è gia presente nel fixtureUtils
      expect(res.body.comments[1].text).to.equal("Questo è un commento di test.");    
    });
  });

  describe("POST /post/:postId/comment failure - validation tests", () => {
    it("aggiunge un commento vuoto - 400", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();
      
      const res = await request(app) 
      .post("/post/" + existingPost._id + "/comment") 
      .set("Authorization", `Bearer ${token}`) 
      .send({ text: "" });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("message");
      expect(res.body.message).to.include("text");
    }); 

    it("invia request con payload vuoto - 400", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();
      
      const res = await request(app) 
      .post("/post/" + existingPost._id + "/comment") 
      .set("Authorization", `Bearer ${token}`) 
      .send({});

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("message");
      expect(res.body.message).to.include("text");
    }); 

    it("invia request con paylod contente campi in più - 400", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();
      
      const res = await request(app) 
      .post("/post/" + existingPost._id + "/comment") 
      .set("Authorization", `Bearer ${token}`) 
      .send({ extraField: "extraValue", text: "Questo è un commento di test." });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("message");
      expect(res.body.message).to.include("extraField");
    });

      it("invia request con paylod contente campi in più - 400", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();
      
      const res = await request(app) 
      .post("/post/" + existingPost._id + "/comment") 
      .set("Authorization", `Bearer ${token}`) 
      .send({ extraField: "extraValue", text: "Questo è un commento di test." });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property("message");
      expect(res.body.message).to.include("extraField");
    
    }); 
  });

  describe("POST /post/:postId/comment failure - authorization tests", () => {
    it("aggiunge un commento - utente non loggato - 401", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();
      
      const res = await request(app) 
      .post("/post/" + existingPost._id + "/comment") 
      .send({ text: "Questo è un commento di test." });

      expect(res.status).to.equal(401);
      expect(res.body).to.have.property("message");
      expect(res.body.message).to.include("token");
    }); 

    it("aggiunge un commento - post non esiste - 404", async () => { 
      const {existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();
      
      const res = await request(app) 
      .post("/post/" + new ObjectId() + "/comment") 
      .set("Authorization", `Bearer ${token}`) 
      .send({ text: "Questo è un commento di test." });

      expect(res.status).to.equal(404);
      expect(res.body).to.have.property("message");
      expect(res.body.message).to.include("not found");
    }); 
  });

  

});

