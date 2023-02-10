import { vi } from "vitest";
import { DocumentReference } from './firestore';
import { DocumentData, MockedDocument } from './helpers/buildDocFromHash.model';
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
  getAll(...refsOrReadOptions: Array<DocumentReference | Record<string, never>>): Promise<Array<MockedDocument>> {
    mockGetAll(...arguments);
    mockGetAllTransaction(...arguments);
    // TODO: Assert that read options, if provided, are the last argument
    // Filter out the read options before calling .get()
    return Promise.all(
      refsOrReadOptions.filter(ref => !!ref.get).map(ref => ref.get())
    );
  }

  get(ref: DocumentReference | Query): Promise<MockedDocument | MockedQuerySnapshot> {
    mockGetTransaction(...arguments);
    return Promise.resolve(ref._get());
  }

  set(ref: DocumentReference, data: DocumentData, options?: { merge: boolean }): Transaction {
    mockSetTransaction(...arguments);
    const args = [...arguments];
    args.shift();
    ref.set(data, options);
    return this;
  }

  update(ref: DocumentReference, data: DocumentData): Transaction {
    mockUpdateTransaction(...arguments);
    const args = [...arguments];
    args.shift();
    ref.update(data);
    return this;
  }

  delete(ref: DocumentReference): Transaction {
    mockDeleteTransaction(...arguments);
    ref.delete();
    return this;
  }

  create(ref: DocumentReference, data: DocumentData): Transaction {
    mockCreateTransaction(...arguments);
    ref.set(data);
    return this;
  }
}
