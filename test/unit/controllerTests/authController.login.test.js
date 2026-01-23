import sinon from "sinon";
import * as chai from "chai";
import sinonChai from "sinon-chai";
chai.use(sinonChai);
const { expect } = chai;

import UserService from "../../../src/domain/services/UserService.js";
import UserRepository from "../../../src/domain/repository/UserRepository.js";
import ConflictError from "../../../src/domain/errors/ConflictError.js";
import cryptoUtils from "../../../src/infrastructure/security/cryptoUtils.js";
import UnauthorizedError from "../../../src/domain/errors/UnauthorizedError.js";

describe("AuthController test", () => {
  process.env.BCRYPT_SALT_ROUNDS = "12";

  afterEach(() => {
    sinon.restore(); // pulizia dopo ogni test
  });

  describe("AuthController.login test", () => {
    describe("AuthController.login success", () => {
      it("dovrebbe inolltrare al service email e password e restituire l'utente", async () => {

        const loginData = { email: "test@example.com", password: "Password01!" };
        const userinDB = { email: "test@example.com", hashedPassword: cryptoUtils.hashPassword(loginData.password, process.env.BCRYPT_SALT_ROUNDS) };

        sinon.stub(UserRepository, "findUserByEmail").resolves(userinDB);

        const result = await UserService.login(loginData);

        expect(result.email).to.deep.equal(loginData.email);
        expect(UserRepository.findUserByEmail).to.have.been.calledOnce;
      });
    });

    describe("AuthController.login failure", () => {
      it("dovrebbe verificare se un utente esiste nel sistema, confrontare la password e restituire l'utente", async () => {

        const loginData = { email: "test@example.com", password: "Password01!" };
        const userinDB = { email: "test@example.com", hashedPassword: cryptoUtils.hashPassword(loginData.password, process.env.BCRYPT_SALT_ROUNDS) };

        sinon.stub(UserRepository, "findUserByEmail").resolves(userinDB);

        const result = await UserService.login(loginData);

        expect(result.email).to.deep.equal(loginData.email);
        expect(UserRepository.findUserByEmail).to.have.been.calledOnce;
      });
    });
  });

  describe("AuthController.register test", () => {
    it("dovrebbe fallire se la password è errata", async () => {
      const correctUserData = { email: "test@example.com", password: "Password01!" };
      const userinDB = { email: "test@example.com", hashedPassword: cryptoUtils.hashPassword(correctUserData.password, process.env.BCRYPT_SALT_ROUNDS) };
      const loginData = { email: "test@example.com", password: "wrongPassword!" };

      sinon.stub(UserRepository, "findUserByEmail").resolves(userinDB);

      const result = await UserService.login(loginData).catch((error) => {
        expect(error).to.be.instanceOf(UnauthorizedError);
        expect(error.message).to.equal("Email or password incorrect");
      });

      expect(UserRepository.findUserByEmail).to.have.been.calledOnce;
    });
  });

  
});
