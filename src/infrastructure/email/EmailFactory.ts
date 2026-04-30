import EmailService from "./EmailService.js";
import emailConfig from "../../config/emailConfig.js";


export default class EmailFactory {

  static create(providerName : string) {
    switch (providerName) {
      case "gmail":
        {
          if (!emailConfig.gmail.user || !emailConfig.gmail.pass) {
            throw new Error("Gmail configuration is missing in emailConfig.");
          }
          return new EmailService({ user: emailConfig.gmail.user, pass: emailConfig.gmail.pass });
        }

        default:
          throw new Error(`Unknown email provider: ${providerName}`);
    }
  }
}

