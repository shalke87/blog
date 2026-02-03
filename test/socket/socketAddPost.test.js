import { expect } from "chai";
import { io as Client } from "socket.io-client";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import createServer from "../../src/createServer.js";
import fixtureUtils from "../fixtures/fixtureUtils.js";
import cryptoUtils from "../../src/infrastructure/security/cryptoUtils.js";

describe.skip("Socket.IO + Actions (test minimale)", () => {
  let server, clientSocket, mongo;
  const PORT = 4001;

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

    const user = await fixtureUtils.createUser();
    const token = cryptoUtils.generateJWT({ userId: user._id.toString() });
    console.log("Generated JWT for test:", token);

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

  it("should reach the post:create action", (done) => {
    clientSocket.emit("post:create", { title: "Hello" });

    clientSocket.on("post:created", (data) => {
      console.log("RECEIVED:", data);
      expect(data).to.exist;
      done();
    });
  });
});
