import sinon from "sinon";
import * as chai from "chai";
import sinonChai from "sinon-chai";
import userModel from "../../src/infrastructure/database/mongoose/models/userModel.js";
import tagModel from "../../src/infrastructure/database/mongoose/models/tagModel.js";
import postModel from "../../src/infrastructure/database/mongoose/models/postModel.js";
import notificationModel from "../../src/infrastructure/database/mongoose/models/notificationModel.js";
import cryptoUtils from "../../src/infrastructure/security/cryptoUtils.js";
chai.use(sinonChai);
import config from "../../config/config.js";


class fixtureUtils {
  mockResponse() {
    return {
      statusCode: null,
      status: sinon.stub().callsFake(function (code) {
        this.statusCode = code;
        return this;
      }),
      json: sinon.stub().returnsThis(),
      send: sinon.stub().returnsThis()
    };
  }

  fakeMongooseDoc(data) {
    return {
      ...data,
      toObject() {
        return { ...data };
      }
    };
  }

  async createUser(userData = {}) {
    const userToStore = {...userData};
    userToStore.username = userData.username || "testuser";
    userToStore.email = userData.email || "test@example.com";
    userToStore.hashedPassword = cryptoUtils.hashPassword(userData.password || "Password01!", process.env.BCRYPT_SALT_ROUNDS);
    userToStore.createdAt = userData.createdAt || new Date();
  
    return await userModel.create(userToStore);
  }

  async getUsers(param = {}) {
    return await userModel.find();
  }

  async getPosts(param = {}) {
    return await postModel.find();
  }

  async getTags(param = {}) {
    return await tagModel.find();
  }

  async createPost(postData) {
    const postToStore = { ...postData };

    postToStore.title = postData.title || "testpost";
    postToStore.content = postData.content || "<p>Test content</p>";
    postToStore.createdAt = postData.createdAt || new Date();
    postToStore.tags = postToStore.tags || [];

    // Crea i tag e ottieni gli ID
    const createdTags = await Promise.all(
      postToStore.tags.map(tag => this.createTag(tag))
    );

    // Sostituisci i nomi con gli ID
    postToStore.tags = createdTags.map(t => t._id);

    return await postModel.create(postToStore);
  }


  async createPostWithAuthorAndPayload(userData = {}, postData = {}) {
    const userToStore = {
              username: userData.username || "testuser999",
              email: userData.email || "test999@example.com",
              password: "Password01!",
              avatarURL: "/uploads/avatars/test_avatar.png"
            };
          const userStored = await this.createUser(userToStore);  //inserisce un utente nel DB in memoria
          const token = cryptoUtils.generateJWT({ userId: userStored._id.toString() }); //genera un token per l'utente
    
          
          const existingPost = await this.createPost({
            title: "Titolo originale del post",
            content: "<p>Contenuto originale del post.</p>",
            status: postData.status || config.POST_STATUS.DRAFT,
            author: userStored._id,
            tags: postData.tags || ["tag1", "tag2"],
            comments: [{
              author: userStored._id,
              text: "Commento originale"
            }]
          });
          
          const newPostPayload = {
              title: postData.title || "Titolo del post",
              content: postData.content || "<p>Questo è un contenuto di test in rich text.</p>",
          };
          return {newPostPayload, existingPost, token, userStored};
  }

  async createTag(tagName) {
    const tagToStore = {
      name: tagName.trim().toLowerCase()
    };
    return await tagModel.create(tagToStore);
  }

  async getNotifications(param = {}) {
    return await notificationModel.find();
  }
}


export default new fixtureUtils();
