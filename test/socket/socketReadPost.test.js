import { expect } from "chai";
import { io as Client } from "socket.io-client";
import mongoose, { isObjectIdOrHexString } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import createServer from "../../src/createServer.js";
import fixtureUtils from "../fixtures/fixtureUtils.js";
import cryptoUtils from "../../src/infrastructure/security/cryptoUtils.js";
import ObjectId from "mongoose/lib/types/objectid.js";

describe("Socket.IO + read post action", () => {
  let server, clientSocket, mongo;
  const PORT = 4001;
  let user, post;

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

    user = await fixtureUtils.createUser();
    post = await fixtureUtils.createPost({author: user._id});
    const token = cryptoUtils.generateJWT({ userId: user._id.toString() });

    clientSocket = Client(`http://localhost:${PORT}`, {
      auth: { token },
      reconnection: false
    });

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.log("Connection timeout - socket not connecting");
        reject(new Error("Socket connection timeout"));
      }, 4000);

      clientSocket.on("connect", () => {
        console.log("Socket connected successfully!");
        clearTimeout(timeout);
        resolve();
      });
      
      clientSocket.on("connect_error", (err) => {
        console.log("CONNECT ERROR:", err.message);
        clearTimeout(timeout);
        reject(err);
      });
    });
  });


  afterEach(() => {
    if (clientSocket) {
      clientSocket.close();
    }
  });

  after(async () => {
    if (clientSocket) {
      clientSocket.close();
    }
    await new Promise((resolve) => {
      server.close(resolve);
    });
    await mongoose.disconnect();
    await mongo.stop();
  });


  describe("Post Read Action", () => {
    it("should reach the post:getById action success", (done) => {
      const payload = {
        postId: post.id
      }
      console.log("Emitting post:getById with payload:", payload);
      clientSocket.emit("post:getById", payload, response => {
        console.log("RESPONSE:", response);
        expect(response).to.exist;
        expect(response.success).to.be.true;
        expect(response.result).to.exist;
        expect(response.result.data.title).to.equal("testpost");
        done();
      });
      
    });
  });

  describe("Post Read Action failure", () => {
    it("should reach the post:getById action but that post does not exist", (done) => {
      const payload = {
        postId: new ObjectId().toString() // ID di un post che non esiste
      }
      clientSocket.emit("post:getById", payload, response => {
        console.log("RESPONSE:", response);
        expect(response).to.exist;
        expect(response.success).to.be.false;
        expect(response.error).to.equal("Resource not found");
        done();
      });
    });
  });
       

  
});
