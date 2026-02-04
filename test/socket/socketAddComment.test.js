import { expect } from "chai";
import { io as Client } from "socket.io-client";
import mongoose, { isObjectIdOrHexString } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import createServer from "../../src/createServer.js";
import fixtureUtils from "../fixtures/fixtureUtils.js";
import cryptoUtils from "../../src/infrastructure/security/cryptoUtils.js";
import ObjectId from "mongoose/lib/types/objectid.js";

describe("Socket.IO + addComment post action", () => {
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
    post = await fixtureUtils.createPost({author: user._id, status: "published", title: "testpost"});
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


  describe("Post Add Comment Action", () => {
    it("should reach the post:addComment action success", (done) => {

      const payload = {
        postId: post._id.toString(), 
        data: {
          text: "This is a test comment"
        }
      };

      console.log("Emitting post:addComment with payload:", payload);
      clientSocket.emit("post:addComment", payload, (response) => {
        try {
          console.log("post:addComment response:", response);
          expect(response).to.exist;
          expect(response.result).to.exist;
          expect(response.result.comments).to.be.an("array");
          expect(response.result.title).to.equal("testpost");
          expect(response.result.comments).to.be.an("array");
          expect(response.result.comments[0].text).to.equal("This is a test comment");
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  
});
