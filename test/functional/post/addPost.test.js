import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../../src/app.js";
import { expect } from "chai";
import fixtureUtils from "../../fixtures/fixtureUtils.js";
import cryptoUtils from "../../../src/infrastructure/security/cryptoUtils.js";
import config from "../../../src/config/config.js";
import e from "express";




describe("Functional add post test: POST /api/post/addPost ", () => {
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
    it("aggiunge un post con tag e restituisce 200 - default draft", async () => { 
      const userToStore = {
          username: "testuser",
          email: "test@example.com",
          password: "Password01!",
          avatarURL: "/uploads/avatars/test_avatar.png",
        };
      const userStored = await fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria
      const token = cryptoUtils.generateJWT({ userId: userStored._id.toString() }); //genera un token per l'utente
      
      const newPostPayload = {
          title: "Titolo del post",
          content: "<p>Questo è un contenuto di test in rich text.</p>",
          tags: ["tag1", "tag2"],        // oppure array di ObjectId se vuoi testare i tag
      };

      const res = await request(app) 
      .post("/api/post/add") 
      .set("Authorization", `Bearer ${token}`) 
      .send(newPostPayload);

      const tagsInDB = await fixtureUtils.getTags();
      const tagsInDBNames = tagsInDB.map(tag => tag.name);
      const tagsInDBIds = tagsInDB.map(tag => tag._id.toString());
      const normalizedTags = newPostPayload.tags.map(t => t.trim().toLowerCase()); 
            
      normalizedTags.forEach( tag => {
        expect(tagsInDBNames).to.include(tag);
      });
      tagsInDBIds.forEach( tagId => {
        expect(res.body.data.tags).to.include(tagId);
      });

      expect(res.body.data.tags.length).to.equal(newPostPayload.tags.length);
      expect(res.body.data.tags.length).to.equal(tagsInDB.length);
      expect(res.status).to.equal(201);
      expect(res.body.data.title).to.equal(newPostPayload.title);
      expect(res.body.data.content).to.equal(newPostPayload.content);
      expect(res.body.data.status).to.equal(config.POST_STATUS.DRAFT);
      expect(res.body.data.author).to.equal(cryptoUtils.verifyJWT(token).userId);
    });

    it("test normalizzazione - elmina duplicati -> lowercase -> restituisce 200", async () => { 
      const userToStore = {
          username: "testuser",
          email: "test@example.com",
          password: "Password01!",
          avatarURL: "/uploads/avatars/test_avatar.png",
        };
      const userStored = await fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria
      const token = cryptoUtils.generateJWT({ userId: userStored._id.toString() }); //genera un token per l'utente
      
      const newPostPayload = {
          title: "Titolo del post",
          content: "<p>Questo è un contenuto di test in rich text.</p>",
          tags: ["TAG1", "TAG1"],        // oppure array di ObjectId se vuoi testare i tag
      };

      const res = await request(app) 
      .post("/api/post/add") 
      .set("Authorization", `Bearer ${token}`) 
      .send(newPostPayload);

      const tagsInDB = await fixtureUtils.getTags();
      const tagsInDBNames = tagsInDB.map(tag => tag.name);
      const tagsInDBIds = tagsInDB.map(tag => tag._id.toString());
      const normalizedTags = newPostPayload.tags.map(t => t.trim().toLowerCase()); 
            
      normalizedTags.forEach( tag => {
        expect(tagsInDBNames).to.include(tag);
      });
      tagsInDBIds.forEach( tagId => {
        expect(res.body.data.tags).to.include(tagId);
      });

 
      expect(res.status).to.equal(201);
      expect(res.body.data.title).to.equal(newPostPayload.title);
      expect(res.body.data.content).to.equal(newPostPayload.content);
      expect(res.body.data.status).to.equal(config.POST_STATUS.DRAFT);
      expect(res.body.data.author).to.equal(cryptoUtils.verifyJWT(token).userId);
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

      const res = await request(app) 
      .post("/api/post/add") 
      .set("Authorization", `Bearer ${token}`) 
      .send(newPostPayload);

      console.log(res.body); 
      expect(res.status).to.equal(201);
      expect(res.body.data.title).to.equal(newPostPayload.title);
      expect(res.body.data.content).to.equal(newPostPayload.content);
      expect(res.body.data.status).to.equal(newPostPayload.status);
      expect(res.body.data.author).to.equal(cryptoUtils.verifyJWT(token).userId);

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
      .post("/api/post/add") 
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
      .post("/api/post/add") 
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
      .post("/api/post/add") 
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
      .post("/api/post/add") 
      .set("Authorization", `Bearer ${token}`) 
      .send(newPostPayload);

      console.log(res.body); 
      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('"status" must be one of [draft, published]');
    });

    it("aggiunge un post con un tag troppo corto", async () => { 
      const userToStore = {
          username: "testuser",
          email: "test@example.com",
          password: "Password01!",
          avatarURL: "/uploads/avatars/test_avatar.png",
        };
      const userStored = await fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria
      const token = cryptoUtils.generateJWT({ userId: userStored._id.toString() }); //genera un token per l'utente
      
      const newPostPayload = {
          title: "Titolo del post",
          content: "<p>Questo è un contenuto di test in rich text.</p>",
          tags: ["t", "tag2"],        // oppure array di ObjectId se vuoi testare i tag
      };

      const res = await request(app) 
      .post("/api/post/add") 
      .set("Authorization", `Bearer ${token}`) 
      .send(newPostPayload);

      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('"tags[0]" length must be at least 2 characters long');

    });

    it("aggiunge un post con un tag che inizia con un numero", async () => { 
      const userToStore = {
          username: "testuser",
          email: "test@example.com",
          password: "Password01!",
          avatarURL: "/uploads/avatars/test_avatar.png",
        };
      const userStored = await fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria
      const token = cryptoUtils.generateJWT({ userId: userStored._id.toString() }); //genera un token per l'utente
      
      const newPostPayload = {
          title: "Titolo del post",
          content: "<p>Questo è un contenuto di test in rich text.</p>",
          tags: ["1tag", "tag2"],        // oppure array di ObjectId se vuoi testare i tag
      };

      const res = await request(app) 
      .post("/api/post/add") 
      .set("Authorization", `Bearer ${token}`) 
      .send(newPostPayload);

      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('"tags[0]" with value "1tag" fails to match the required pattern: /^[A-Za-z][A-Za-z0-9]*$/');

    });

    
  });
    
});


