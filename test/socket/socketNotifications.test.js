import { expect } from "chai";
import { io as Client } from "socket.io-client";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import createServer from "../../src/createServer.js";
import fixtureUtils from "../fixtures/fixtureUtils.js";
import cryptoUtils from "../../src/infrastructure/security/cryptoUtils.js";

describe("Socket.IO notifications", () => {
  let server, ownerSocket, triggerSocket, mongo;
  const PORT = 4001;
  let ownerUser, triggerUser, post;

  before(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    await mongoose.connect(uri);
    
    ({ server } = createServer());
    await new Promise((resolve) => {
      server.listen(PORT, resolve);
    });
  });

  beforeEach(async () => {
    // Pulisci il database prima di ogni test
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }

    ownerUser = await fixtureUtils.createUser({username: "Post Owner", email: "owner@example.com"});
    triggerUser = await fixtureUtils.createUser({username: "Trigger User", email: "trigger@example.com"});
    post = await fixtureUtils.createPost({author: ownerUser._id, status: "published"});
    const ownerToken = cryptoUtils.generateJWT({ userId: ownerUser._id.toString() });
    const triggerToken = cryptoUtils.generateJWT({ userId: triggerUser._id.toString() });

    ownerSocket = Client(`http://localhost:${PORT}`, {
      auth: { token: ownerToken },
      reconnection: false
    });

    triggerSocket = Client(`http://localhost:${PORT}`, {
      auth: { token: triggerToken },
      reconnection: false
    });

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.log("Connection timeout - socket not connecting");
        reject(new Error("Socket connection timeout"));
      }, 4000);

      ownerSocket.on("connect", () => {
        console.log("Socket connected successfully!");
        clearTimeout(timeout);
        resolve();
      });
      
      ownerSocket.on("connect_error", (err) => {
        console.log("CONNECT ERROR:", err.message);
        clearTimeout(timeout);
        reject(err);
      });
    });

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.log("Connection timeout - socket not connecting");
        reject(new Error("Socket connection timeout"));
      }, 4000);

      triggerSocket.on("connect", () => {
        console.log("Socket connected successfully!");
        clearTimeout(timeout);
        resolve();
      });
      
      triggerSocket.on("connect_error", (err) => {
        console.log("CONNECT ERROR:", err.message);
        clearTimeout(timeout);
        reject(err);
      });
    });


  });



  afterEach(() => {
    if (ownerSocket) {
      ownerSocket.close();
    }
    if (triggerSocket) {
      triggerSocket.close();
    }
  });

  after(async () => {
    if (ownerSocket) {
      ownerSocket.close();
    }
    if (triggerSocket) {
      triggerSocket.close();
    }
    await new Promise((resolve) => {
      server.close(resolve);
    });
    await mongoose.disconnect();
    await mongo.stop();
  });

  describe("Post Comment Action", () => {
    it("should send a notification to the post author when the post is commented", (done) => {
      const payload = {
        postId: post._id,
        data: { 
          text: "Questo è un commento di prova.", 
        }
      };

      let notificationReceived = false;

      // 1️⃣ Intercetta la notifica PRIMA di emettere l'update
      ownerSocket.on("notification:new", (notification) => {
        console.log("Received notification:", notification, notificationReceived);  
        expect(notification).to.have.property("type", "comment");
        expect(notification).to.have.property("postId", post._id.toString());
        expect(notification).to.have.property("fromUser", triggerUser.username);
      });

      // 2️⃣ Emetti l'evento post:addComment
      triggerSocket.emit("post:addComment", payload, response => {
        try {
          // 3️⃣ Verifica la risposta dell'azione
          expect(response.success).to.be.true;
          expect(response.result).to.exist;
          expect(response.result.comments).to.be.an("array");
          expect(response.result.comments).to.have.lengthOf(1);
          expect(response.result.comments[0]).to.have.property("text", "Questo è un commento di prova.");
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  describe("Post toggleLike Action", () => {
    it("should send a notification to the post author when the post is liked", (done) => {
      
      let notificationReceived = false;

      // 1️⃣ Intercetta la notifica PRIMA di emettere l'update
      ownerSocket.on("notification:new", (notification) => {
        notificationReceived = true;

        expect(notification).to.have.property("type", "like");
        expect(notification).to.have.property("postId", post._id.toString());
        expect(notification).to.have.property("fromUser", triggerUser.username);
      });

      // 2️⃣ Emetti l'evento post:toggleLike
      triggerSocket.emit("post:toggleLike", { postId: post._id }, response => {
        try {
          // 3️⃣ Verifica la risposta dell'azione
          console.log("ToggleLike response:", response);
          expect(response.success).to.be.true;
          expect(response.result).to.exist;
          expect(response.result.data.likes).to.be.an("array");
          expect(response.result.data.likes).to.have.lengthOf(1);
          expect(response.result.data.likes[0]).to.equal(triggerUser._id.toString());
          done();
        } catch (err) {
          done(err);
        }
      });
    });

  });

});
