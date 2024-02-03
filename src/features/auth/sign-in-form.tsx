"use client";

import { useFormState } from "react-dom";
import { signIn } from "./sign-in-action";

const initialState = {
  error: "",
};
export function SignInForm() {
  const [state, formAction] = useFormState(signIn, initialState);
  console.log(state);
  return (
    <form action={formAction}>
      <label htmlFor="email">Email</label>
      <input name="email" id="email" />
      <br />
      <label htmlFor="password">Password</label>
      <input type="password" name="password" id="password" />
      <br />
      <button>Continue</button>
      {state.error && <p>{state.error}</p>}
    </form>
  );
}
