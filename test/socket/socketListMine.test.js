import { expect } from "chai";
import { io as Client } from "socket.io-client";
import mongoose, { isObjectIdOrHexString } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import createServer from "../../src/createServer.js";
import fixtureUtils from "../fixtures/fixtureUtils.js";
import cryptoUtils from "../../src/infrastructure/security/cryptoUtils.js";
import config from "../../src/config/config.js";
import ObjectId from "mongoose/lib/types/objectid.js";

describe("Socket.IO + listMine post action", () => {
  let server, clientSocket, mongo;
  const PORT = 4001;
  let user, post, post2;

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
    post = await fixtureUtils.createPost({author: user._id, status: config.POST_STATUS.PUBLISHED, title: "testpost", content: "The first post"});
    post2 = await fixtureUtils.createPost({author: user._id, status: config.POST_STATUS.PUBLISHED, title: "testpost2", content: "The second post"});
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


  describe("Post List Mine Action", () => {
    it("should reach the post:listMine action success", (done) => {
      
      clientSocket.emit("post:listMine", {}, (response) => {
        try {
          console.log("post:listMine response:", response);
          expect(response).to.exist;
          expect(response.result).to.exist;
          expect(response.result.data).to.be.an("array");
          expect(response.result.data[0].title).to.equal("testpost");
          expect(response.result.data[1].title).to.equal("testpost2");
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  
});
