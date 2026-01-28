import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../../src/app.js";
import { expect } from "chai";
import fixtureUtils from "../../fixtures/fixtureUtils.js";
import cryptoUtils from "../../../src/infrastructure/security/cryptoUtils.js";
import config from "../../../config/config.js";




describe("Functional add post test: POST /post/addPost ", () => {
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

  describe("POST /post/addPost success", () => {
    it("aggiunge un post e restituisce 200 - default draft", async () => { 
      const userToStore = {
          username: "testuser",
          email: "test@example.com",
          password: "Password01!",
          avatarURL: "/uploads/avatars/test_avatar.png"
        };
      const userStored = await fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria
      const token = cryptoUtils.generateJWT({ userId: userStored._id.toString() }); //genera un token per l'utente
      
      const newPostPayload = {
          title: "Titolo del post",
          content: "<p>Questo è un contenuto di test in rich text.</p>",
          tags: [],        // oppure array di ObjectId se vuoi testare i tag
      };

      console.log("Payload del nuovo post:", newPostPayload);

      
      const res = await request(app) 
      .post("/post/add") 
      .set("Authorization", `Bearer ${token}`) 
      .send(newPostPayload);

      console.log(res.body); 
      expect(res.status).to.equal(201);
      expect(res.body.title).to.equal(newPostPayload.title);
      expect(res.body.content).to.equal(newPostPayload.content);
      expect(res.body.status).to.equal(config.POST_STATUS.DRAFT);
      expect(res.body.author).to.equal(cryptoUtils.verifyJWT(token).userId);
    });

    it("aggiunge un post e restituisce 200 - status published", async () => { 
      const userToStore = {
          username: "testuser",
          email: "test@example.com",
          password: "Password01!",
          avatarURL: "/uploads/avatars/test_avatar.png"
        };
      const userStored = await fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria
      const token = cryptoUtils.generateJWT({ userId: userStored._id.toString() }); //genera un token per l'utente
      
      const newPostPayload = {
          title: "Titolo del post",
          content: "<p>Questo è un contenuto di test in rich text.</p>",
          tags: [],        // oppure array di ObjectId se vuoi testare i tag
          status: config.POST_STATUS.PUBLISHED
      };

      console.log("Payload del nuovo post:", newPostPayload);

      
      const res = await request(app) 
      .post("/post/add") 
      .set("Authorization", `Bearer ${token}`) 
      .send(newPostPayload);

      console.log(res.body); 
      expect(res.status).to.equal(201);
      expect(res.body.title).to.equal(newPostPayload.title);
      expect(res.body.content).to.equal(newPostPayload.content);
      expect(res.body.status).to.equal(newPostPayload.status);
      expect(res.body.author).to.equal(cryptoUtils.verifyJWT(token).userId);
    });
  });

  describe("POST /post/addPost failure", () => {
    it("prova ad aggiungere un post, utente non loggato", async () => { 
      const newPostPayload = {
          title: "Titolo del post",
          content: "<p>Questo è un contenuto di test in rich text.</p>",
          status: config.POST_STATUS.DRAFT,
          tags: [],        // oppure array di ObjectId se vuoi testare i tag
      };

      console.log("Payload del nuovo post:", newPostPayload);

      const res = await request(app) 
      .post("/post/add") 
      .send(newPostPayload);

      console.log(res.body); 
      expect(res.status).to.equal(401);
      expect(res.body.message).to.equal("Missing or invalid token");
    });

    it("prova ad aggiungere un post, titolo troppo corto - validation error", async () => { 
      const userToStore = {
          username: "testuser",
          email: "test@example.com",
          password: "Password01!",
          avatarURL: "/uploads/avatars/test_avatar.png"
        };
      const userStored = await fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria
      const token = cryptoUtils.generateJWT({ userId: userStored._id.toString() }); //genera un token per l'utente
      
      const newPostPayload = {
          title: "T",
          content: "<p>Questo è un contenuto di test in rich text.</p>",
          status: config.POST_STATUS.DRAFT,
          tags: [],        // oppure array di ObjectId se vuoi testare i tag
      };

      console.log("Payload del nuovo post:", newPostPayload);

      
      const res = await request(app) 
      .post("/post/add") 
      .set("Authorization", `Bearer ${token}`) 
      .send(newPostPayload);

      console.log(res.body); 
      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('"title" length must be at least 3 characters long');
    });

    it("prova ad aggiungere un post, content troppo corto - validation error", async () => { 
      const userToStore = {
          username: "testuser",
          email: "test@example.com",
          password: "Password01!",
          avatarURL: "/uploads/avatars/test_avatar.png"
        };
      const userStored = await fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria
      const token = cryptoUtils.generateJWT({ userId: userStored._id.toString() }); //genera un token per l'utente
      
      const newPostPayload = {
          title: "Titolo del post",
          content: "<p>Te</p>",
          status: config.POST_STATUS.DRAFT,
          tags: [],        // oppure array di ObjectId se vuoi testare i tag
      };

      console.log("Payload del nuovo post:", newPostPayload);

      
      const res = await request(app) 
      .post("/post/add") 
      .set("Authorization", `Bearer ${token}`) 
      .send(newPostPayload);

      console.log(res.body); 
      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('"content" length must be at least 10 characters long');
    });

    it("prova ad aggiungere un post, status non valido - validation error", async () => { 
      const userToStore = {
          username: "testuser",
          email: "test@example.com",
          password: "Password01!",
          avatarURL: "/uploads/avatars/test_avatar.png"
        };
      const userStored = await fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria
      const token = cryptoUtils.generateJWT({ userId: userStored._id.toString() }); //genera un token per l'utente
      
      const newPostPayload = {
          title: "Titolo del post",
          content: "<p>Testo valido per il contenuto del post.</p>",
          status: "invalid_status",
          tags: [],        // oppure array di ObjectId se vuoi testare i tag
      };

      console.log("Payload del nuovo post:", newPostPayload);

      
      const res = await request(app) 
      .post("/post/add") 
      .set("Authorization", `Bearer ${token}`) 
      .send(newPostPayload);

      console.log(res.body); 
      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('"status" must be one of [draft, published]');
    });
  });
    
});


