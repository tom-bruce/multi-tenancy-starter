import { CodedDomainError } from "@/domain/shared/error";

export class UserAlreadyExistsError extends CodedDomainError<"UserAlreadyExists"> {
  constructor(message?: string, options?: ErrorOptions) {
    super("UserAlreadyExists", message, options);
  }
}
