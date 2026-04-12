import sinon from "sinon";
import * as chai from "chai";
import sinonChai from "sinon-chai";
chai.use(sinonChai);
const { expect } = chai;

import UserService from "../../../src/services/AuthService.js";
import ConflictError from "../../../src/domain/errors/ConflictError.js";
import UnauthorizedError from "../../../src/domain/errors/UnauthorizedError.js";
import AuthController from "../../../src/api/rest/controllers/AuthController.js";
import fixtureUtils from "../../fixtures/fixtureUtils.js";
import authConfig from "../../../config/authConfig.js";

describe("AuthController test", () => {
  authConfig.BCRYPT_SALT_ROUNDS = "12";

  afterEach(() => {
    sinon.restore(); // pulizia dopo ogni test
  });

  describe("AuthController.register test", () => {
    describe("AuthController.register success", () => {
      it("dovrebbe inoltrare i dati utente e restituire 201:OK se inseriti (mock del service)", async () => {

        const userData = { username: "testuser", email: "test@example.com", password: "Password01!" };
        const userFromService = {
          _id: "67b0c2f4a1d3c9e8f4a12bcd",
          username: "testuser",
          email: "test@example.com",
          createdAt: "2025-01-23T10:15:42.123Z",
          __v: 0
        }
        const req = { body: userData };
        const res = fixtureUtils.mockResponse();
        const next = sinon.spy();

        sinon.stub(UserService, "register").resolves(userFromService);

        await AuthController.register(req,res,next);

        expect(res.statusCode).to.equal(201);
        expect(UserService.register).to.have.been.calledOnce;
        expect(res.json).to.have.been.calledWith(userFromService);
      });
    });

    describe("AuthController.register failure", () => {
      it("fallisce se utente gia presente", async () => {

        const userData = { username: "testuser", email: "test@example.com", password: "Password01!" };
        const req = { body: userData };
        const res = fixtureUtils.mockResponse();
        const next = sinon.spy();

        const conflictError = new ConflictError("User already exists");
        sinon.stub(UserService, "register").rejects(conflictError);

        await AuthController.register(req,res,next);

        expect(UserService.register).to.have.been.calledOnce;
        expect(next).to.have.been.calledWith(conflictError);
      });
    });
  });

  describe("AuthController.register test", () => {
    it("dovrebbe fallire se la password è errata", async () => {
      const userData = { username: "testuser", email: "test@example.com", password: "wrongPassword" };
        const req = { body: userData };
        const res = fixtureUtils.mockResponse();
        const next = sinon.spy();

        const unauthorizedError = new UnauthorizedError("Email or password incorrect");
        sinon.stub(UserService, "register").rejects(unauthorizedError);

        await AuthController.register(req,res,next);
        
        expect(UserService.register).to.have.been.calledOnce;
        expect(next).to.have.been.calledWith(unauthorizedError);
    });
  });

  
});
