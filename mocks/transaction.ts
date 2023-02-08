import { vi } from "vitest";

export const mockGetAll = vi.fn();
export const mockGetAllTransaction = vi.fn();
export const mockGetTransaction = vi.fn();
export const mockSetTransaction = vi.fn();
export const mockUpdateTransaction = vi.fn();
export const mockDeleteTransaction = vi.fn();
export const mockCreateTransaction = vi.fn();

export class Transaction {
  getAll(...refsOrReadOptions) {
    mockGetAll(...arguments);
    mockGetAllTransaction(...arguments);
    // TODO: Assert that read options, if provided, are the last argument
    // Filter out the read options before calling .get()
    return Promise.all(
      refsOrReadOptions.filter(ref => !!ref.get).map(ref => ref.get())
    );
  }

  get(ref) {
    mockGetTransaction(...arguments);
    return Promise.resolve(ref._get());
  }

  set(ref) {
    mockSetTransaction(...arguments);
    const args = [...arguments];
    args.shift();
    ref.set(...args);
    return this;
  }

  update(ref) {
    mockUpdateTransaction(...arguments);
    const args = [...arguments];
    args.shift();
    ref.update(...args);
    return this;
  }

  delete(ref) {
    mockDeleteTransaction(...arguments);
    ref.delete();
    return this;
  }

  create(ref, options) {
    mockCreateTransaction(...arguments);
    ref.set(options);
    return this;
  }
}
