export class CodedDomainError<Code extends string = string> extends Error {
  readonly failureCode: Code;
  constructor(failureCode: Code, message?: string, options?: ErrorOptions) {
    super(message, options);
    this.failureCode = failureCode;
  }
}

export class NotFoundError extends CodedDomainError<"NOT_FOUND"> {
  constructor(message?: string, options?: ErrorOptions) {
    super("NOT_FOUND", message, options);
  }
}
