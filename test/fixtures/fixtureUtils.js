import sinon from "sinon";
import * as chai from "chai";
import sinonChai from "sinon-chai";
import userModel from "../../src/infrastructure/database/mongoose/models/userModel.js";
import tagModel from "../../src/infrastructure/database/mongoose/models/tagModel.js";
import postModel from "../../src/infrastructure/database/mongoose/models/postModel.js";
import cryptoUtils from "../../src/infrastructure/security/cryptoUtils.js";
chai.use(sinonChai);


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

  async createUser(userData) {
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
    const postToStore = {...postData};
    postToStore.title = postData.title || "testpost";
    postToStore.content = postData.content || "<p>Test content</p>";
    postToStore.createdAt = postData.createdAt || new Date();
    if(!postToStore.tags) {
      postToStore.tags = [];
    }
    const tagResult = await tagModel.insertMany(
      postToStore.tags.map(name => ({ name: name.trim().toLowerCase() }))
    );
    postToStore.tags = tagResult.map(tag => tag._id);
    console.log("post to store in fixtureUtils.createPost:", postToStore);

    return await postModel.create(postToStore);
  }

  async createPostWithAuthorAndPayload(username = "testuser", email = "test@example.com") {
    const userToStore = {
              username: username,
              email: email,
              password: "Password01!",
              avatarURL: "/uploads/avatars/test_avatar.png"
            };
          const userStored = await this.createUser(userToStore);  //inserisce un utente nel DB in memoria
          const token = cryptoUtils.generateJWT({ userId: userStored._id.toString() }); //genera un token per l'utente
    
          const existingPost = await this.createPost({
            title: "Titolo originale del post",
            content: "<p>Contenuto originale del post.</p>",
            author: userStored._id
          });
          
          const newPostPayload = {
              title: "Titolo del post",
              content: "<p>Questo è un contenuto di test in rich text.</p>",
              tags: [],        // oppure array di ObjectId se vuoi testare i tag
          };
          return { newPostPayload, existingPost, token};
  }
}


export default new fixtureUtils();
