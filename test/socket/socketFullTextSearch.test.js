import { expect } from "chai";
import { io as Client } from "socket.io-client";
import mongoose, { isObjectIdOrHexString } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import createServer from "../../src/createServer.js";
import fixtureUtils from "../fixtures/fixtureUtils.js";
import cryptoUtils from "../../src/infrastructure/security/cryptoUtils.js";
import ObjectId from "mongoose/lib/types/objectid.js";

describe("Socket.IO + full text search action", () => {
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
    await mongoose.connection.db.dropDatabase();
    await Promise.all(
      Object.values(mongoose.models).map(model => model.syncIndexes())
    );


    user = await fixtureUtils.createUser();
    await fixtureUtils.createPost({author: user._id, status: "published", title: "Il primo post di test", content: "Scrivo la parola test sia nel titolo che nel contenuto per verificare se la ricerca full text funziona correttamente"});
    await fixtureUtils.createPost({author: user._id, status: "published", title: "Il secondo post di test", content: "In questo post la parola da cercare è presente solo nel titolo, non nel contenuto"});
    await fixtureUtils.createPost({author: user._id, status: "published", title: "Il terzo post", content: "In questo invece la parola test è presente solo nel contenuto, come sottostringa: TESTpost"});
    await fixtureUtils.createPost({author: user._id, status: "published", title: "Il terzo post", content: "Scrivo la parola da cercare solo nei tag", tags: ["test"]});
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


  describe("Post List Published Action", () => {
    it("should reach the post:fullTextSearch action success", (done) => {
      
      const query = "test";
      clientSocket.emit("post:fullTextSearch", {query : query}, (response) => {
        try {
          console.log("post:fullTextSearch response:", response);
          expect(response).to.exist;
          expect(response.result).to.exist;
          expect(response.result.data).to.be.an("array");
          expect(response.result.data.length).to.equal(4); // Tutti e tre i post contengono la parola "test" in titolo o contenuto
          const resultPosts = response.result.data;
          console.log("Posts returned from fullTextSearch:", resultPosts);
          resultPosts.forEach(post => {
            const haystack = `${post.title} ${post.content} ${post.tags.join(" ")}`.toLowerCase();
            console.log(`Checking if post with title "${post.title}" contains the query "${query}":`, haystack);
            expect(haystack).to.include(query.toLowerCase());
          });
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  
});
