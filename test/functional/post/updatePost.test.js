import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../../src/app.js";
import { expect } from "chai";
import fixtureUtils from "../../fixtures/fixtureUtils.js";
import cryptoUtils from "../../../src/infrastructure/security/cryptoUtils.js";
import config from "../../../src/config/config.js";




describe("Functional update post test: PATCH /post/update/:postId ", () => {
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

  describe("PATCH /post/update/:postId success", () => {
    it("modifica un post e restituisce 200 - e nuovo contenuto", async () => { 
      const {newPostPayload, existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload({},{status: config.POST_STATUS.DRAFT});
      

      console.log("Payload del nuovo post:", newPostPayload);

      const res = await request(app) 
      .patch("/api/post/update/" + existingPost._id) 
      .set("Authorization", `Bearer ${token}`) 
      .send(newPostPayload);

      console.log("res.body:", res.body); 
      expect(res.status).to.equal(200);
      expect(res.body.data.title).to.equal(newPostPayload.title);
      expect(res.body.data.content).to.equal(newPostPayload.content);
      expect(res.body.data.status).to.equal(config.POST_STATUS.DRAFT);
      expect(res.body.data.author.id).to.equal(cryptoUtils.verifyJWT(token).userId);
    });

    it("modifica i tag di un post - aggiunge nuovi tag e restituisce 200", async () => { 
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
              tags: ["tag3", "tag4"],        // oppure array di ObjectId se vuoi testare i tag
          };

        const postToStore = {
              title: "Titolo del post",
              content: "<p>Questo è un contenuto di test in rich text.</p>",
              author: userStored._id,
              tags: ["tag1", "tag2"],        // oppure array di ObjectId se vuoi testare i tag
          };
          const existingPost = await fixtureUtils.createPost(postToStore);
    
          const res = await request(app) 
          .patch("/api/post/update/" + existingPost._id) 
          .set("Authorization", `Bearer ${token}`) 
          .send(newPostPayload);
    
          const tagsInDB = await fixtureUtils.getTags();
          const tagsInDBNames = tagsInDB.map(tag => tag.name);
          const tagsInDBIds = tagsInDB.map(tag => tag._id.toString());
          console.log("res post", res.body);
          const normalizedPayloadTags = newPostPayload.tags.map(t => t.trim().toLowerCase()); 
                
          normalizedPayloadTags.forEach( tag => {
            expect(tagsInDBNames).to.include(tag);
          });
          res.body.data.tags.forEach( tagName => {
            expect(tagsInDBNames).to.include(tagName);
          });
          
    
    
          expect(res.status).to.equal(200);
          expect(res.body.data.title).to.equal(newPostPayload.title);
          expect(res.body.data.content).to.equal(newPostPayload.content);
          expect(res.body.data.status).to.equal(config.POST_STATUS.DRAFT);
          expect(res.body.data.author.id).to.equal(cryptoUtils.verifyJWT(token).userId);
        });

        it("modifica i tag di un post - passa oggetto con tags non valorizzati", async () => { 
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
              content: "<p>Questo è un contenuto di test in rich text.</p>"
          };

        const postToStore = {
              title: "Titolo del post",
              content: "<p>Questo è un contenuto di test in rich text.</p>",
              author: userStored._id,
              tags: ["tag1", "tag2"],        // oppure array di ObjectId se vuoi testare i tag
          };
          const existingPost = await fixtureUtils.createPost(postToStore);
    
          const res = await request(app) 
          .patch("/api/post/update/" + existingPost._id) 
          .set("Authorization", `Bearer ${token}`) 
          .send(newPostPayload);
    
          const tagsInDB = await fixtureUtils.getTags();
          const tagsInDBNames = tagsInDB.map(tag => tag.name);
          const tagsInDBIds = tagsInDB.map(tag => tag._id.toString());
          console.log("Tags in DB after update:", tagsInDB);
          console.log("Response tags names:",  res.body.data.tags);
                
          const normalizedTags = [];
          normalizedTags.forEach( tag => {
            expect(tagsInDBNames).to.include(tag);
          });
          tagsInDBNames.forEach( tagName => {
            expect(res.body.data.tags).to.include(tagName);
          });
    
    
          expect(res.body.data.tags.length).to.equal(tagsInDB.length);
          expect(res.status).to.equal(200);
          expect(res.body.data.title).to.equal(newPostPayload.title);
          expect(res.body.data.content).to.equal(newPostPayload.content);
          expect(res.body.data.status).to.equal(config.POST_STATUS.DRAFT);
          expect(res.body.data.author.id).to.equal(cryptoUtils.verifyJWT(token).userId);
        });
  });

  describe("PATCH /api/post/update/:postId failure", () => {
    it("prova a modificare un post, utente non loggato", async () => { 
      
      const {newPostPayload, existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();

      console.log("Payload del nuovo post:", newPostPayload);

      const res = await request(app) 
      .patch("/api/post/update/" + existingPost._id) 
      .send(newPostPayload);

      console.log("res.body:", res.body); 
      expect(res.status).to.equal(401);
      expect(res.body.message).to.equal("Missing or invalid token");
    });

    it("prova ad aggiungere un post, titolo troppo corto - validation error", async () => { 
      const {newPostPayload, existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();

      newPostPayload.title = "Ti"; //titolo troppo corto

      console.log("Payload del nuovo post:", newPostPayload);

      
      const res = await request(app) 
      .patch("/api/post/update/" + existingPost._id) 
      .set("Authorization", `Bearer ${token}`) 
      .send(newPostPayload);

      console.log("res.body:", res.body); 
      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('"title" length must be at least 3 characters long');
    });

    it("prova ad aggiungere un post, content troppo corto - validation error", async () => { 
      
      const {newPostPayload, existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();

      newPostPayload.content = "<p>Te</p>";

      console.log("Payload del nuovo post:", newPostPayload);

      
      const res = await request(app) 
      .patch("/api/post/update/" + existingPost._id) 
      .set("Authorization", `Bearer ${token}`) 
      .send(newPostPayload);

      console.log("res.body:", res.body); 
      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('"content" length must be at least 10 characters long');
    });

    it("prova ad aggiungere un post, status non valido - validation error", async () => { 
      const {newPostPayload, existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();

      newPostPayload.status = "invalid status"; //status non valido
      console.log("Payload del nuovo post:", newPostPayload);

      
      const res = await request(app) 
      .patch("/api/post/update/" + existingPost._id) 
      .set("Authorization", `Bearer ${token}`) 
      .send(newPostPayload);

      console.log("res.body:", res.body); 
      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('"status" must be one of [draft, published]');
    });

    it("prova ad aggiungere un post, param mal formato - validation error", async () => { 
      const {newPostPayload, existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();

      console.log("Payload del nuovo post:", newPostPayload);

      const res = await request(app) 
      .patch("/api/post/update/" + "invalidParam") 
      .set("Authorization", `Bearer ${token}`) 
      .send(newPostPayload);

      console.log("res.body:", res.body); 
      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('"postId" must only contain hexadecimal characters. "postId" length must be 24 characters long');
    });

    it("prova ad aggiungere un post, nessun param - 404 - no route", async () => { 
      const {newPostPayload, existingPost, token} = await fixtureUtils.createPostWithAuthorAndPayload();

      console.log("Payload del nuovo post:", newPostPayload);

      const res = await request(app) 
      .patch("/api/post/update/") 
      .set("Authorization", `Bearer ${token}`) 
      .send(newPostPayload);

      console.log("res.body:", res.body); 
      expect(res.status).to.equal(404);
    });
  });
    
});


