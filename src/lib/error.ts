export class CodedError<TCode extends string> extends Error {
  readonly code: TCode;
  constructor(code: TCode, message?: string) {
    super(message);
    this.code = code;
  }
}
