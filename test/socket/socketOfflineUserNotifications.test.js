import { expect } from "chai";
import { io as Client } from "socket.io-client";
import mongoose, { set } from "mongoose";
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
    const triggerToken = cryptoUtils.generateJWT({ userId: triggerUser._id.toString() });

    

    triggerSocket = Client(`http://localhost:${PORT}`, {
      auth: { token: triggerToken },
      reconnection: false
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
    it.only("should send a notification to the post author when the post is commented", async () => {
      const ownerToken = cryptoUtils.generateJWT({ userId: ownerUser._id.toString() });
      const payload = {
        postId: post._id,
        data: { 
          text: "Questo è un commento di prova.", 
        }
      };

      
      await new Promise(resolve => {
        triggerSocket.emit("post:addComment", payload, resolve);
      });

      await new Promise(resolve => {
        triggerSocket.emit("post:addComment", payload, resolve);
      });
    
      
      const receivedNotifications = [];
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.log("Connection timeout - socket not connecting");
          reject(new Error("Socket connection timeout"));
        }, 4000);

        ownerSocket = Client(`http://localhost:${PORT}`, {
          auth: { token: ownerToken },
          reconnection: false
        });

        ownerSocket.on("notification:new", (notification) => {
          receivedNotifications.push(notification);
          console.log("Received notification:", notification);
          ownerSocket.emit("notification:markAsRead", { notificationId: notification.id }, (response) => {
            expect(response).to.exist;
            expect(response.success).to.be.true;
            console.log("Mark as read response:", response);
          }); // risponde al server, comunica lettura della notifica

          if (receivedNotifications.length === 2) {
            clearTimeout(timeout);
            resolve();
          }
        });

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

      expect(receivedNotifications).to.have.lengthOf(2);
      const notifications = await fixtureUtils.getNotifications();
      consolre.log("Notifications in DB:", notifications);
      expect(notifications).to.have.lengthOf(2);
      expect(notifications[0].read).to.be.true;
      expect(notifications[1].read).to.be.true;

      for (const notification of receivedNotifications) {
        expect(notification).to.have.property("type", "comment");
        expect(notification).to.have.property("postId", post._id.toString());
        expect(notification).to.have.property("fromUser", triggerUser.username);
      }
    });
  });


  describe("Post toggleLike Action", () => {
    it("should send a notification to the post author when the post is liked", async () => {
      
      await new Promise(resolve => {        
        triggerSocket.emit("post:toggleLike", { postId: post._id }, resolve);
      });
      await new Promise(resolve => {        
        triggerSocket.emit("post:toggleLike", { postId: post._id }, resolve);
      });

      const receivedNotifications = [];
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Socket connection timeout"));
        }, 4000);

        ownerSocket = Client(`http://localhost:${PORT}`, {
          auth: { token: cryptoUtils.generateJWT({ userId: ownerUser._id.toString() }) },
          reconnection: false
        });

        ownerSocket.on("notification:new", (notification) => {
          receivedNotifications.push(notification);
          if (receivedNotifications.length === 1) {
            clearTimeout(timeout);
            resolve();
          }
        });

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
      expect(receivedNotifications).to.have.lengthOf(1);
      const postFromDB = await fixtureUtils.getPosts({_id: post._id});
      expect(postFromDB[0].likes).to.have.lengthOf(0);   // il like è stato messo e tolto, quindi alla fine non ci sono like
      
    });

  });

  describe("Notification failure", () => {
    it("should get an error if the notification fails to be marked as read - notification ID formally invalid", async () => {
      const ownerToken = cryptoUtils.generateJWT({ userId: ownerUser._id.toString() });
      const payload = {
        postId: post._id,
        data: { 
          text: "Questo è un commento di prova.", 
        }
      };

      // Trigger the comment action twice to generate two notifications
      await new Promise(resolve => {
        triggerSocket.emit("post:addComment", payload, resolve);
      });

      await new Promise(resolve => {
        triggerSocket.emit("post:addComment", payload, resolve);
      });
    
      
      const receivedNotifications = [];
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.log("Connection timeout - socket not connecting");
          reject(new Error("Socket connection timeout"));
        }, 4000);

        ownerSocket = Client(`http://localhost:${PORT}`, {
          auth: { token: ownerToken },
          reconnection: false
        });

        ownerSocket.on("connect_error", (err) => {
          console.log("CONNECT ERROR:", err.message);
          reject(err);
        });

        ownerSocket.on("notification:new", (notification) => {
          receivedNotifications.push(notification);
          console.log("Received notification:", notification);

          ownerSocket.emit("notification:markAsRead", { notificationId: "fakeNotificationId" }, (response) => {
            try {
              expect(response).to.exist;
              expect(response.success).to.be.false;

              if (receivedNotifications.length === 2) {
                clearTimeout(timeout);
                resolve();
              }
            } catch (err) {
              clearTimeout(timeout);
              reject(err);
            }
   
          }); 
        });
      });     

      expect(receivedNotifications).to.have.lengthOf(2);

    });

    it("should get an error if the notification fails to be marked as read - non-existent notification ID", async () => {
      const ownerToken = cryptoUtils.generateJWT({ userId: ownerUser._id.toString() });
      const payload = {
        postId: post._id,
        data: { 
          text: "Questo è un commento di prova.", 
        }
      };

      // Trigger the comment action twice to generate two notifications
      await new Promise(resolve => {
        triggerSocket.emit("post:addComment", payload, resolve);
      });

      await new Promise(resolve => {
        triggerSocket.emit("post:addComment", payload, resolve);
      });
    
      
      const receivedNotifications = [];
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.log("Connection timeout - socket not connecting");
          reject(new Error("Socket connection timeout"));
        }, 4000);

        ownerSocket = Client(`http://localhost:${PORT}`, {
          auth: { token: ownerToken },
          reconnection: false
        });

        ownerSocket.on("connect_error", (err) => {
          console.log("CONNECT ERROR:", err.message);
          reject(err);
        });

        ownerSocket.on("notification:new", (notification) => {
          receivedNotifications.push(notification);
          console.log("Received notification:", notification);

          ownerSocket.emit("notification:markAsRead", { notificationId: new mongoose.Types.ObjectId().toString() }, (response) => {
            try {
              expect(response).to.exist;
              expect(response.success).to.be.false;

              if (receivedNotifications.length === 2) {
                clearTimeout(timeout);
                resolve();
              }
            } catch (err) {
              clearTimeout(timeout);
              reject(err);
            }
   
          }); 
        });
      });     

      expect(receivedNotifications).to.have.lengthOf(2);
      const notifications = await fixtureUtils.getNotifications();
      expect(notifications).to.have.lengthOf(2);
      expect(notifications[0].read).to.be.false;
      expect(notifications[1].read).to.be.false;

    });
  });

});
