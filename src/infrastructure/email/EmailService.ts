import nodemailer from "nodemailer";

class EmailService {
  private transporter;
  private from : string;

  constructor(config : { user: string; pass: string }) {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.user,
        pass: config.pass
      }
    });
    this.from = config.user;
  }

  async send({ to, subject, text, html }: { to: string; subject: string; text?: string; html?: string }) {
    return this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      text,
      html
    });
  }
}

export default EmailService;