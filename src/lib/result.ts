type Success<T> = { _ok: true; value: T };
type Fail<E> = { _ok: false; error: E };
export type Result<T, E> = Success<T> | Fail<E>;

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
