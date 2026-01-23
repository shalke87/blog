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
    await userModel.create({
      username: userData.username || "testuser",
      email: userData.email || "test@example.com",
      hashedPassword: cryptoUtils.hashPassword(userData.password || "Password01!", process.env.BCRYPT_SALT_ROUNDS),
      createdAt: new Date()
    });
  }

}


export default new fixtureUtils();
