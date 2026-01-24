import nodemailer from "nodemailer";

class EmailService {
  constructor(config) {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.user,
        pass: config.pass
      }
    });
  }

  async send({ to, subject, text, html }) {
    return this.transporter.sendMail({
      from: this.transporter.options.auth.user,
      to,
      subject,
      text,
      html
    });
  }
}

export default EmailService;