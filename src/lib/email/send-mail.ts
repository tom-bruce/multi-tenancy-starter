import { resend } from "./resend";

interface SendMailProps {
  react: JSX.Element;
  to: string;
  subject: string;
  from?: string;
}
export async function sendMail({ react, to, subject, from }: SendMailProps) {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    console.warn(
      `All emails are being send to ${process.env.RESEND_DEVELOPMENT_TO_ADDRESS!} in development`
    );
  }

  return resend.emails.send({
    from: from ?? process.env.RESEND_DEFAULT_FROM_EMAIL_ADDRESS!,
    to: isProd ? to : process.env.RESEND_DEVELOPMENT_TO_ADDRESS!,
    subject,
    react,
  });
}
