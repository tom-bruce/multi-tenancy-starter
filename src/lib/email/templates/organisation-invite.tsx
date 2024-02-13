import { Body, Container, Head, Html, Link, Text } from "@react-email/components";
interface OrganisationInviteProps {
  acceptInviteUrl: string;
  oragnisationName: string;
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

export default function OrganisationInvite({
  acceptInviteUrl,
  oragnisationName,
}: OrganisationInviteProps) {
  return (
    <Html>
      <Head />
      <Body style={main}></Body>
      <Container style={container}>
        <Text style={text}>Hi there,</Text>
        <Text style={text}>
          You have been invited to join the {oragnisationName} organisation in Template.
        </Text>
        <Link style={button} href={acceptInviteUrl}>
          Accept Invite
        </Link>
        <Text style={text}>
          If you don&apos;t want to accept this invite, please ignore and delete this message.
        </Text>
        <Text style={text}>The Template Team</Text>
      </Container>
    </Html>
  );
}
