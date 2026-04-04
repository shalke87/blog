import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../../src/app.js";
import { expect } from "chai";
import fixtureUtils from "../../fixtures/fixtureUtils.js";
import cryptoUtils from "../../../src/infrastructure/security/cryptoUtils.js";
import config from "../../../config/config.js";




describe("Functional list pagination test: GET /post/listPublished ", () => {
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

  describe("GET /post/listPublished pagination test success", () => {
    it("legge una pagina di post pubblicati - utente non loggato", async () => { 
      const user = await fixtureUtils.createUser({
        username: "testuser",
        email: "test@example.com",
        password: "1234"
      });
      const posts = [];
      for (let i = 1; i <= 25; i++) {
        const post = await fixtureUtils.createPost({
          title: `Post numero ${i}`,
          content: `<p>Contenuto del post numero ${i}.</p>`,
          author: user._id,
          status: config.POST_STATUS.PUBLISHED
        });
        posts.push(post);
      }
      const page = 3;
      const limit = 10;

      const res = await request(app) 
      .get(`/post/listPublished?page=${page}&limit=${limit}`);

      expect(res.status).to.equal(200);
      res.body.data.forEach(post => {
        expect(post.author._id.toString()).to.equal(user._id.toString());
        expect(post.status).to.equal(config.POST_STATUS.PUBLISHED);
      });
      expect(res.body.data.length).to.equal(5); //verifico che abbia restituito 5 post
      expect(res.body.page).to.equal(page.toString());
      expect(res.body.limit).to.equal(limit.toString());
      expect(res.body.total).to.equal(25);
      expect(res.body.totalPages).to.equal(Math.ceil(25 / limit));
    });

    it("lancia listPublished - 0 contenuti", async () => { 
      
      const res = await request(app) 
      .get("/post/listPublished");
      
      expect(res.status).to.equal(200);
      expect(res.body.data).to.deep.equal([]); //verifico che l'array sia vuoto
      
    });

    it("non passa valori di page e limit, validator imposta i default", async () => { 
      
      const res = await request(app) 
      .get(`/post/listPublished`);

      expect(res.status).to.equal(200);
      expect(res.body.data).to.deep.equal([]); //verifico che l'array sia vuoto
    });

  });

  describe("GET /post/listPublished pagination failure", () => {

    it("passa un limite fuori range, errore 400 del validator", async () => { 
      
      const page = 1;
      const limit = 200;

      const res = await request(app) 
      .get(`/post/listPublished?page=${page}&limit=${limit}`);
      
      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('"limit" must be less than or equal to 100');
    });

    it("passa valori che non sono numerici", async () => { 
      
      const page = "one";
      const limit = "ten";

      const res = await request(app) 
      .get(`/post/listPublished?page=${page}&limit=${limit}`);
      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal('"page" must be a number. "limit" must be a number');
    });
   
  });


});


