import sinon from "sinon";
import * as chai from "chai";
import sinonChai from "sinon-chai";
chai.use(sinonChai);
const { expect } = chai;

import AuthService from "../../../src/services/AuthService.js";
import UserRepository from "../../../src/domain/repository/UserRepository.js";
import cryptoUtils from "../../../src/infrastructure/security/cryptoUtils.js";
import config from "../../../config/config.js";
import authConfig from "../../../config/authConfig.js";

describe("AuthService.resetPasswordRequest", () => {
  authConfig.BCRYPT_SALT_ROUNDS = "12";

  afterEach(() => {
    sinon.restore(); // pulizia dopo ogni test
  });

  describe("AuthService.resetPasswordRequest success", () => {
    it("se email esiste, manda un token di reset della password, lo memorizza", async () => {

      const userData = { email: "test@example.com", password: "Password01!" };
      const userinDB = { email: "test@example.com", 
        hashedPassword: cryptoUtils.hashPassword(userData.password, authConfig.BCRYPT_SALT_ROUNDS),
        resetToken: cryptoUtils.generateRandomToken(),
        resetTokenExpiration: Date.now() + config.PASSWORD_RESET_TTL
      };

      sinon.stub(UserRepository, "storeResetToken").resolves(userinDB);
      sinon.stub(AuthService, "sendResetTokenEmail").resolves("email sent");

      const result = await AuthService.resetPasswordRequest(userData);
      console.log("Result of resetPasswordRequest:", result);

      expect(result.message).to.deep.equal('If the email exists, a reset token has been sent.');
      expect(UserRepository.storeResetToken).to.have.been.calledOnce;
      expect(AuthService.sendResetTokenEmail).to.have.been.calledOnce;
    });
  });

  describe("AuthService.resetPasswordRequest failure", () => {
    
  });

  
});
