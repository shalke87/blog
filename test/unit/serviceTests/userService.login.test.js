import sinon from "sinon";
import * as chai from "chai";
import sinonChai from "sinon-chai";
chai.use(sinonChai);
const { expect } = chai;

import AuthService from "../../../src/services/AuthService.js";
import UserRepository from "../../../src/domain/repository/UserRepository.js";
import cryptoUtils from "../../../src/infrastructure/security/cryptoUtils.js";
import UnauthorizedError from "../../../src/domain/errors/UnauthorizedError.js";
import authConfig from "../../../src/config/authConfig.js";

describe("UserService.login", () => {

  afterEach(() => {
    sinon.restore(); // pulizia dopo ogni test
  });

  describe("UserService.login success", () => {
    it("dovrebbe verificare se un utente esiste nel sistema, confrontare la password e restituire l'utente e il token JWT", async () => {

      const loginData = { email: "test@example.com", password: "Password01!" };
      const userinDB = { email: "test@example.com", status: authConfig.USER_STATUS.ACTIVE, hashedPassword: cryptoUtils.hashPassword(loginData.password, authConfig.BCRYPT_SALT_ROUNDS) };

      sinon.stub(UserRepository, "findUserByEmail").resolves(userinDB);

      const result = await AuthService.login(loginData);


      expect(result.userData.email).to.deep.equal(loginData.email);
      expect(UserRepository.findUserByEmail).to.have.been.calledOnce;
      expect(result).to.have.property("tokenJWT");
      expect(result.tokenJWT).to.deep.equal(cryptoUtils.generateJWT({ userId: userinDB._id }));
    });
  });

  describe("UserService.login failure", () => {
    it("dovrebbe fallire se la password è errata", async () => {
      const correctUserData = { email: "test@example.com", password: "Password01!" };
      const userinDB = { email: "test@example.com", status: authConfig.USER_STATUS.ACTIVE, hashedPassword: cryptoUtils.hashPassword(correctUserData.password, authConfig.BCRYPT_SALT_ROUNDS) };
      const loginData = { email: "test@example.com", password: "wrongPassword!" };

      sinon.stub(UserRepository, "findUserByEmail").resolves(userinDB);

      const result = await AuthService.login(loginData).catch((error) => {
        expect(error).to.be.instanceOf(UnauthorizedError);
        expect(error.message).to.equal("Email or password incorrect");
      });

      expect(UserRepository.findUserByEmail).to.have.been.calledOnce;
    });

    it("dovrebbe fallire se l'utente non esiste", async () => {
      const correctUserData = { email: "test@example.com", password: "Password01!" };
      const userinDB = { email: "test@example.com", status: authConfig.USER_STATUS.ACTIVE, hashedPassword: cryptoUtils.hashPassword(correctUserData.password, authConfig.BCRYPT_SALT_ROUNDS) };
      const loginData = { email: "wrongEmail@example.com", password: "Password01!" };

      sinon.stub(UserRepository, "findUserByEmail").resolves(userinDB);

      const result = await AuthService.login(loginData).catch((error) => {
        expect(error).to.be.instanceOf(UnauthorizedError);
        expect(error.message).to.equal("Email or password incorrect");
      });

      expect(UserRepository.findUserByEmail).to.have.been.calledOnce;
    });

    it("dovrebbe fallire se lo status dell'utente non è active", async () => {
      const correctUserData = { email: "test@example.com", password: "Password01!" };
      const userinDB = { email: "test@example.com", status: authConfig.USER_STATUS.PENDING, hashedPassword: cryptoUtils.hashPassword(correctUserData.password, authConfig.BCRYPT_SALT_ROUNDS) };
      const loginData = { email: "test@example.com", password: "Password01!" };

      sinon.stub(UserRepository, "findUserByEmail").resolves(userinDB);

      const result = await AuthService.login(loginData).catch((error) => {
        expect(error).to.be.instanceOf(UnauthorizedError);
        expect(error.message).to.equal("Email or password incorrect");
      });

      expect(UserRepository.findUserByEmail).to.have.been.calledOnce;
    });
  });
  
});
