import { EmailSendError } from "@/domain/email/email.error";
import { IEmailService } from "@/domain/email/email.interface";
import assert from "assert";
import { Resend } from "resend";

export class ResendEmailService implements IEmailService {
  private _resend: Resend;
  constructor() {
    assert(process.env.RESEND_API_KEY, "RESEND API KEY NOT DEFINED");
    this._resend = new Resend(process.env.RESEND_API_KEY);
  }
  async sendMail({
    to,
    from,
    react,
    subject,
  }: {
    to: string;
    from: string;
    subject: string;
    react: JSX.Element;
  }) {
    const _resendResult = await this._resend.emails.send({
      from,
      to,
      subject,
      react,
    });
    if (_resendResult.error) {
      // TODO rewrap resend error?
      throw new EmailSendError("Error sending email", { cause: _resendResult.error });
    }
    return;
  }
}

export class NoOpEmailService implements IEmailService {
  async sendMail(mailArgs: { to: string; from: string; subject: string; react: JSX.Element }) {
    const props = Object.fromEntries(
      Object.entries(mailArgs.react.props).filter(([key]) => key !== "children")
    );
    const printProps: typeof mailArgs = { ...mailArgs, react: { ...mailArgs.react, props } };
    console.log(
      "No-op email service sending emails with parameters: ",
      JSON.stringify(printProps, null, 2)
    );
    return;
  }
}
