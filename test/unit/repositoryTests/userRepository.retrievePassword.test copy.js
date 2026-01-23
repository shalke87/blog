import sinon from "sinon";
import * as chai from "chai";
import sinonChai from "sinon-chai";
chai.use(sinonChai);
const { expect } = chai;

import UserRepository from "../../../src/domain/repository/UserRepository.js";
import UserModel from "../../../src/infrastructure/database/mongoose/models/userModel.js";
import fixtureUtils from "../../fixtures/fixtureUtils.js";


describe("UserRepository.createUser", () => {
    afterEach(() => {
      sinon.restore(); // pulizia dopo ogni test
    });

    describe("UserRepository.createUser success", () => {

        it("dovrebbe inserire un utente nel DB e restituirlo", async () => {
            const fakeUser = { email: "test@example.com", username: "stefano", password: "Password01!" };

            const fakeMongooseDoc = fixtureUtils.fakeMongooseDoc(fakeUser);
            sinon.stub(UserModel, "create").resolves(fakeMongooseDoc);

            const result = await UserRepository.createUser(fakeUser);

            expect(result).to.deep.equal(fakeUser);
            expect(UserModel.create).to.have.been.calledOnce;
        });
    });

    describe("UserRepository.createUser failure", () => {

      const dbError = new Error("DB error");

      it("dovrebbe rilanciare l'errore provocato da DB", async () => {
        const fakeUser = { email: "test@example.com", username: "stefano", password: "Password01!" };

        sinon.stub(UserRepository, "createUser").rejects(dbError);

    
        const res = await UserRepository.createUser(fakeUser).catch(e => e);
        expect(res).to.be.instanceOf(Error);
        expect(res.message).to.equal("DB error");
      });
    });
});
  


