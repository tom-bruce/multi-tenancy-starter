export interface UserDTO {
  id: string;
  email: string;
  verifiedAt: Date | null;
  // TODO What to do about the hashed password?
}

export interface UserWithPasswordDTO extends UserDTO {
  hashedPassword: string | null;
}
