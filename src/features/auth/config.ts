export const SIGN_IN_URL = "/auth/sign-in";

export const SIGN_UP_URL = "/auth/sign-up";

export const SIGN_UP_ERRORS = {
  EMAIL_IN_USE: "Email already in use",
};

export const VERIFY_RESET_TOKEN_URL = "/auth/reset-password";

export const VERIFY_EMAIL_URL = "/auth/verify-email";

export const SIGN_IN_ERRORS = {
  INVALID_CREDENTIALS: "Invalid email or password",
  USER_LINKED_WITH_ANOTHER_ACCOUNT:
    "Email might be linked with another account and cannot use password authentication",
};

export const RESET_TOKEN_ERRORS = {
  TOKEN_EXPIRED: "Your token has expired. Please request a new one and try again.",
  TOKEN_NOT_FOUND: "Token not found. Please request a new one and try again.",
};

export const TRIGGER_RESET_ERRORS = {
  EMAIL_NOT_FOUND: "An account doesn't exist with this email",
};

export const VERIFY_EMAIL_ERRORS = {
  CODE_EXPIRED: "Your verification code has expired. Please request a new one and try again.",
  INVALID_CODE: "Incorrect code, please double check your code and try again.",
};
