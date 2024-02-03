// export type Result<TValue, TError extends { message: string } = { message: string }> =
//   | {
//       value: TValue;
//       error?: never;
//     }
//   | {
//       value?: never;
//       error: TError;
//     };

// function success<TValue>(value: TValue): Result<TValue> {
//   return { value };
// }

// function fail<TError extends { message: string }>(error: TError): Result<any, TError> {
//   return { error };
// }

type Success<T> = { _ok: true; value: T };
type Fail<E> = { _ok: false; error: E };
type Result<T, E> = Success<T> | Fail<E>;

function success<T>(value: T): Success<T> {
  return { _ok: true, value };
}

function fail<E>(error: E): Fail<E> {
  return { _ok: false, error };
}

export const result = {
  success,
  fail,
};
