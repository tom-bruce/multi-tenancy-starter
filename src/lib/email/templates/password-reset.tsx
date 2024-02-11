import { Body, Button, Container, Head, Html, Link, Text } from "@react-email/components";
interface PasswordResetProps {
  resetUrl: string;
}
const main = {
  backgroundColor: "#f6f9fc",
  padding: "10px 0",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #f0f0f0",
  padding: "45px",
};

const text = {
  fontSize: "16px",
  fontFamily:
    "'Inter', 'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
  fontWeight: "300",
  color: "#404040",
  lineHeight: "26px",
};

const button = {
  backgroundColor: "#007ee6",
  borderRadius: "4px",
  color: "#fff",
  fontFamily: "'Open Sans', 'Helvetica Neue', Arial",
  fontSize: "15px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "210px",
  padding: "14px 7px",
};

export default function PasswordReset({ resetUrl }: PasswordResetProps) {
  return (
    <Html>
      <Head />
      <Body style={main}></Body>
      <Container style={container}>
        <Text style={text}>Hi there,</Text>
        <Text style={text}>
          Someone recently requested a password reset for your Template account. If this was you,
          you can set a new password here
        </Text>
        <Link style={button} href={resetUrl}>
          Reset password
        </Link>
        <Text style={text}>
          If you don&apos;t want to change your password or didn&apos;t request this, just ignore
          and delete this message.
        </Text>
        <Text style={text}>The Template Team</Text>
      </Container>
    </Html>
  );
}
