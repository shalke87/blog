import sinon from "sinon";
import * as chai from "chai";
import sinonChai from "sinon-chai";
import userModel from "../../src/infrastructure/database/mongoose/models/userModel.js";
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
   
    await userModel.create(userToStore);
  }

  async getUsers() {
    return await userModel.find();
  }

}


export default new fixtureUtils();
