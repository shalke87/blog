import sinon from "sinon";
import * as chai from "chai";
import sinonChai from "sinon-chai";
chai.use(sinonChai);
const { expect } = chai;

import AuthService from "../../../src/services/AuthService.js";
import UserRepository from "../../../src/domain/repository/UserRepository.js";
import ConflictError from "../../../src/domain/errors/ConflictError.js";
import authConfig from "../../../config/authConfig.js";

describe("AuthService.register success", () => {
  authConfig.BCRYPT_SALT_ROUNDS = "12";

  afterEach(() => {
    sinon.restore(); // pulizia dopo ogni test
  });

  it("dovrebbe creare un utente quando i dati sono validi", async () => {
      const fakeUser = { email: "test@example.com", username: "stefano", password: "Password01!" };

      sinon.stub(UserRepository, "createUser").resolves(fakeUser);

      const result = await AuthService.register(fakeUser);

      expect(result).to.deep.equal(fakeUser);
      expect(UserRepository.createUser).to.have.been.calledOnce;
  });

  it("dovrebbe lanciare ConflictError se username è già esistente", async () => {
      const duplicateError = new Error("duplicate");
      duplicateError.code = 11000;
      const fakeUser = { email: "test@example.com", username: "stefano", password: "Password01!" };

      sinon.stub(UserRepository, "createUser").rejects(duplicateError);

  
      const res = await AuthService.register(fakeUser).catch(error => { 
        expect(error).to.be.instanceOf(ConflictError);
        expect(error.message).to.equal("Username or email already exists");
      });
  
  });

  it("dovrebbe rilanciare errori non gestiti", async () => {
      const genericError = new Error("DB offline");
      const fakeUser = { email: "test@example.com", username: "stefano", password: "Password01!" };

      sinon.stub(UserRepository, "createUser").rejects(genericError);

      const res = await AuthService.register(fakeUser).catch(error => {
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal("DB offline");
      });
  });
});
