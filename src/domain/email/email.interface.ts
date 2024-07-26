export interface IEmailService {
  sendMail(emailArgs: {
    to: string;
    from: string;
    subject: string;
    react: JSX.Element;
  }): Promise<void>;
}
