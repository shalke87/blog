import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import app from "../../../src/app.js";
import { expect } from "chai";
import fixtureUtils from "../../fixtures/fixtureUtils.js";
import fs from "fs"; 
import path from "path";
import cryptoUtils from "../../../src/infrastructure/security/cryptoUtils.js";
import config from "../../../config/config.js";


const avatarDir = path.join(process.cwd(), "uploads", "avatars");
console.log("Avatar directory path:", avatarDir);

describe("Functional upload avatar test: POST /user/uploadAvatar ", () => {
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
    const avatarTestDir = path.join(config.AVATAR.FILE_SYSTEM_PATH); // impostare percorso corretto da config ambiente test
    console.log("Avatar directory path:", avatarTestDir);
    try { 
      const files = await fs.promises.readdir(avatarTestDir); 
      await Promise.all( files.map(file => fs.promises.unlink(path.join(avatarTestDir, file)) ) ); 
    } catch (err) { 
      console.error("Errore durante la pulizia avatar:", err); 
    }
    await mongoose.disconnect();
    await mongo.stop();

  });

  describe("POST /user/uploadAvatar success", () => {
    it("carica un avatar e restituisce 200", async () => { 
      console.log("ENV:", process.env.NODE_ENV); console.log("PATH:", config.AVATAR.FILE_SYSTEM_PATH);
      const userToStore = {
          username: "testuser",
          email: "test@example.com",
          password: "Password01!"
        };
      const userStored = await fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria
      const token = cryptoUtils.generateJWT({ userId: userStored._id.toString() }); //genera un token per l'utente
      const fileName = "test_avatar.png";
      
      const res = await request(app) 
      .patch("/user/uploadAvatar") 
      .set("Authorization", `Bearer ${token}`) 
      .attach("avatar", `test/fixtures/files/${fileName}`) // <-- QUI fai l’upload 

      const regex = new RegExp( `^\\/uploads\\/avatars\\/[a-f0-9]{24}-\\d+-${fileName}$` ); 
      console.log(res.body); 
      expect(res.status).to.equal(200);
      expect(res.body.avatarURL).to.match(regex);
    });
  });

  describe("POST /user/uploadAvatar failure", () => {
    it("manda una request senza inviare il file", async () => { 
      const userToStore = {
          username: "testuser",
          email: "test@example.com",
          password: "Password01!"
        };
      const userStored = await fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria
      const token = cryptoUtils.generateJWT({ userId: userStored._id.toString() }); //genera un token per l'utente
      const fileName = "wrong_file_name.png";
      
      const res = await request(app) 
      .patch("/user/uploadAvatar") 
      .set("Authorization", `Bearer ${token}`) //non invio nessun file
      
      const regex = new RegExp( `^\\/uploads\\/avatars\\/[a-f0-9]{24}-\\d+-${fileName}$` ); 
      console.log(res.body); 
      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal("No file uploaded.");
    });

    it("carica un file troppo grosso", async () => { 
      fs.mkdirSync("test/tmp", { recursive: true }); 
      const tmpFile = path.join("test", "tmp", "bigfile.bin");       // Creo un file temporaneo più grande del limite consentito
      fs.writeFileSync(tmpFile, Buffer.alloc(3 * 1024 * 1024));

      const userToStore = {
          username: "testuser",
          email: "test@example.com",
          password: "Password01!"
        };
      const userStored = await fixtureUtils.createUser(userToStore);  //inserisce un utente nel DB in memoria
      const token = cryptoUtils.generateJWT({ userId: userStored._id.toString() }); //genera un token per l'utente
      const fileName = "wrong_file_name.png";
      
      const res = await request(app) 
      .patch("/user/uploadAvatar") 
      .set("Authorization", `Bearer ${token}`) //non invio nessun file
      .attach("avatar", tmpFile)
      
      fs.unlinkSync(tmpFile);
      const regex = new RegExp( `^\\/uploads\\/avatars\\/[a-f0-9]{24}-\\d+-${fileName}$` ); 
      console.log(res.body); 
      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal("File too large");
    });
  });

  
    
});


