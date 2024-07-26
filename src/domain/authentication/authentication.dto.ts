export interface PasswordResetTokenDTO {
  userId: string;
  code: string;
  expiresAt: Date;
}

export interface EmailTokenDTO {
  email: string;
  userId: string;
  expiresAt: Date;
  code: string;
}
