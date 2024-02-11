import assert from "assert";
import { Resend } from "resend";

assert(process.env.RESEND_API_KEY, "RESEND API KEY NOT DEFINED");
export const resend = new Resend(process.env.RESEND_API_KEY);
