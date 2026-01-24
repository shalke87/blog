import EmailService from "./EmailService.js";
import emailConfig from "../../../config/emailConfig.js";


export default class EmailFactory {

  static create(providerName) {
    switch (providerName) {
      case "gmail":
        return new EmailService(emailConfig.gmail);

      default:
        throw new Error(`Unknown email provider: ${providerName}`);
    }
  }
}

