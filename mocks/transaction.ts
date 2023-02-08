import { vi } from "vitest";
import { MockedQuerySnapshot } from './helpers/buildQuerySnapShot.model';
import { Query } from './query';

export const mockGetAll = vi.fn();
export const mockGetAllTransaction = vi.fn();
export const mockGetTransaction = vi.fn();
export const mockSetTransaction = vi.fn();
export const mockUpdateTransaction = vi.fn();
export const mockDeleteTransaction = vi.fn();
export const mockCreateTransaction = vi.fn();

export class Transaction {
  getAll(...refsOrReadOptions: Array<Query | Record<string, never>>): Promise<Array<MockedQuerySnapshot>> {
    mockGetAll(...arguments);
    mockGetAllTransaction(...arguments);
    // TODO: Assert that read options, if provided, are the last argument
    // Filter out the read options before calling .get()
    return Promise.all(
      refsOrReadOptions.filter(ref => !!ref.get).map(ref => ref.get())
    );
  }

  get(ref: Query): Promise<MockedQuerySnapshot> {
    mockGetTransaction(...arguments);
    return Promise.resolve(ref._get());
  }

  set(ref: Query): Transaction {
    mockSetTransaction(...arguments);
    const args = [...arguments];
    args.shift();
    ref.set(...args);
    return this;
  }

  update(ref: Query): Transaction {
    mockUpdateTransaction(...arguments);
    const args = [...arguments];
    args.shift();
    ref.update(...args);
    return this;
  }

  delete(ref: Query): Transaction {
    mockDeleteTransaction(...arguments);
    ref.delete();
    return this;
  }

  create(ref: Query, options: unknown): Transaction {
    mockCreateTransaction(...arguments);
    ref.set(options);
    return this;
  }
}
