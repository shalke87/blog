import { expect } from "chai";
import { io as Client } from "socket.io-client";
import mongoose, { isObjectIdOrHexString } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import createServer from "../../src/createServer.js";
import fixtureUtils from "../fixtures/fixtureUtils.js";
import cryptoUtils from "../../src/infrastructure/security/cryptoUtils.js";
import ObjectId from "mongoose/lib/types/objectid.js";

describe("Socket.IO + deleteComment post action", () => {
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
    post = await fixtureUtils.createPost({author: user._id, status: "published", title: "testpost",
        comments : [{ text: "This is a test comment", author: user._id }]
    });
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


  describe("Post Delete Comment Action", () => {
    it("should reach the post:deleteComment action success", (done) => {
      const payload = {
        postId: post._id.toString(),
        commentId: post.comments[0]._id.toString(),
      };
      clientSocket.emit("post:deleteComment", payload, (response) => {
        try {
          console.log("post:deleteComment response:", response);
          expect(response).to.exist;
          expect(response.result).to.exist;
          expect(response.result.data.title).to.equal("testpost");
          expect(response.result.data.comments).to.be.an("array");
          expect(response.result.data.comments).to.have.lengthOf(0);
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  
});
