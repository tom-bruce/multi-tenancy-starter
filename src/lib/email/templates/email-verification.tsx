import { Body, Container, Head, Html, Text } from "@react-email/components";

interface WelcomeProps {
  email: string;
  verificationCode: string;
}
const main = {
  backgroundColor: "#f6f9fc",
  padding: "10px 0",
};

const container = {
  marginTop: "20px",
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

export default function EmailVerification({ email, verificationCode }: WelcomeProps) {
  return (
    <Html>
      <Head />
      <Body style={main}></Body>
      <Container style={container}>
        <Text style={text}>Hi there,</Text>
        <Text style={text}>Welcome to Placeholder. We&apos;re excited to have you on board.</Text>
        <Text style={text}>
          Before you can begin using our platform we require that you confirm your email.
        </Text>
        <Text style={text}>Please enter the following code in the application:</Text>
        <pre style={text}>{verificationCode}</pre>
        <Text style={text}>The Placeholder Team</Text>
      </Container>
    </Html>
  );
}
