import { CodedDomainError } from "@/domain/shared/error";

export class EmailSendError extends CodedDomainError<"EMAIL_ERROR"> {
  constructor(message?: string, options?: ErrorOptions) {
    super("EMAIL_ERROR", message, options);
  }
}
