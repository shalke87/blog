import sinon from "sinon";
import * as chai from "chai";
import sinonChai from "sinon-chai";
chai.use(sinonChai);
const { expect } = chai;

import UserService from "../../../src/domain/services/UserService.js";
import ConflictError from "../../../src/domain/errors/ConflictError.js";
import cryptoUtils from "../../../src/infrastructure/security/cryptoUtils.js";
import { ObjectId } from "mongodb";
import fixtureUtils from "../../fixtures/fixtureUtils.js";
import AuthController from "../../../src/api/rest/controllers/AuthController.js";

describe("AuthController test", () => {
  process.env.BCRYPT_SALT_ROUNDS = "12";

  afterEach(() => {
    sinon.restore(); // pulizia dopo ogni test
  });

  describe("AuthController.login test", () => {
    describe("AuthController.login success", () => {
      it("dovrebbe estrapolare i dati utente dalla request e restituire 201:OK se inseriti (mock del service)", async () => {

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
        const tokenJWT = cryptoUtils.generateJWT({ userId: new ObjectId("67b0c2f4a1d3c9e8f4a12bcd") });
        sinon.stub(UserService, "login").resolves({userData: userFromService, tokenJWT: tokenJWT});

        await AuthController.login(req,res,next);

        expect(res.statusCode).to.equal(200);
        expect(UserService.login).to.have.been.calledOnce;
        expect(res.json).to.have.been.calledWith({
                user: userFromService,
                tokenJWT: tokenJWT,
                message: "Login successful"
            });
      });
    });

    describe("AuthController.login failure", () => {
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

  
});
