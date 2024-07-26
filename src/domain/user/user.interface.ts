import { UserDTO, UserWithPasswordDTO } from "@/domain/user/user.dto";

export interface IUserRepository {
  byEmail(email: string): Promise<UserDTO | null>;
  byEmailWithPassword(email: string): Promise<UserWithPasswordDTO | null>;
  create(createUserArgs: { email: string; hashedPassword: string }): Promise<UserDTO>;
}
