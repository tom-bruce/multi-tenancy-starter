import { CodedDomainError } from "@/domain/shared/error";

type Success<D> = { success: true; data: D };
type Failure<E extends CodedDomainError> = { success: false; error: E };
export type Result<D, E extends CodedDomainError> = Success<D> | Failure<E>;

export function fail<C extends string, E extends CodedDomainError<C>>(e: E): Failure<E> {
  return { success: false, error: e };
}
export function succeed<D>(d: D): Success<D> {
  return { success: true, data: d };
}
