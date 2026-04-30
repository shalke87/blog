import sinon from "sinon";
import * as chai from "chai";
import sinonChai from "sinon-chai";
import { MongoServerError } from "mongodb";
chai.use(sinonChai);
const { expect } = chai;

import AuthService from "../../../src/services/AuthService.js";
import UserRepository from "../../../src/domain/repository/UserRepository.js";
import ConflictError from "../../../src/domain/errors/ConflictError.js";
import authConfig from "../../../src/config/authConfig.js";
import e from "cors";

describe("AuthService.register success", () => {

  afterEach(() => {
    sinon.restore(); // pulizia dopo ogni test
  });

  it("dovrebbe creare un utente quando i dati sono validi", async () => {
      const fakeUser = { email: "test@example.com", username: "stefano", password: "Password01!" };

      sinon.stub(UserRepository, "createUser").resolves(fakeUser);

      const result = await AuthService.register(fakeUser);

      expect(result.username).to.deep.equal(fakeUser.username);
      expect(result.email).to.deep.equal(fakeUser.email);
      expect(UserRepository.createUser).to.have.been.calledOnce;
  });

  it("dovrebbe lanciare ConflictError se username è già esistente", async () => {
      const duplicateError = new MongoServerError("duplicate");
      duplicateError.code = 11000;
      const fakeUser = { email: "test@example.com", username: "stefano", password: "Password01!" };

      sinon.stub(UserRepository, "createUser").rejects(duplicateError);

  
      const res = await AuthService.register(fakeUser).catch(error => { 
        console.log("Caught error:", error);
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
