import { resend } from "./resend";

interface SendMailProps {
  react: JSX.Element;
  to: string;
  subject: string;
}
export async function sendMail({ react, to, subject }: SendMailProps) {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) {
    console.warn("Email to and from addressed are being overridden in development mode");
  }
  return resend.emails.send({
    from: isProd ? "" : "onboarding@resend.dev",
    to: isProd ? to : process.env.RESEND_DEVELOPMENT_TO_ADDRESS!,
    subject,
    react,
  });
}
