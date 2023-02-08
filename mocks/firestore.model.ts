import type { Mock } from 'vitest';
import type { FieldValue } from './fieldValue';
import type { Query } from './query';
import type { Timestamp } from './timestamp';
import type { Transaction } from './transaction';
import type { FieldPath } from './path';

import type { MockedDocument, DocumentData } from './helpers/buildDocFromHash';
import type { MockedQuerySnapshot } from './helpers/buildQuerySnapShot';

export interface DatabaseDocument extends DocumentData {
  id: string;
  _collections?: DatabaseCollections;
}

export interface DatabaseCollections {
  [collectionName: string]: Array<DatabaseDocument> | undefined;
}

export interface SetOptions {
  merge?: boolean;
}

export interface FirestoreBatch {
  delete(): FirestoreBatch;
  set(doc: DocumentReference, data: DocumentData, options?: SetOptions): FirestoreBatch;
  update(doc: DocumentReference, data: DocumentData): FirestoreBatch;
  commit(): Promise<void>;
}

export type FakeFirestoreDatabase = DatabaseCollections;

export class FakeFirestore {
  static FieldValue: typeof FieldValue;
  static Timestamp: typeof Timestamp
  static Query: typeof Query;
  static Transaction: typeof Transaction;
  static FieldPath: typeof FieldPath;

  static DocumentReference: typeof DocumentReference;
  static CollectionReference: typeof CollectionReference;

  database: FakeFirestoreDatabase;
  options: Record<string, never>;
  query: Query;
  collectionName: string;

  constructor(stubbedDatabase?: DatabaseCollections, options?: Record<string, never>);

  getAll(): Array<MockedQuerySnapshot>;
  batch(): FirestoreBatch;
  settings(): void;
  useEmulator(): void;
  collection(collectionName: string): CollectionReference;
  collectionGroup(collectionName: string): Query;
  doc(path: string): DocumentReference;
  runTransaction<T>(updateFunction: (transaction: Transaction) => Promise<T>): Promise<T>;
}

export declare class DocumentReference {
  id: string;
  parent: CollectionReference;
  firestore: FakeFirestore;
  path: string;

  constructor(id: string, parent: CollectionReference);

  collection(collectionName: string): CollectionReference;
  delete(): Promise<void>;
  get(): Promise<MockedDocument>;

  update(object: DocumentData): Promise<MockedDocument>;
  set(object: DocumentData): Promise<MockedDocument>;

  isEqual(other: DocumentReference): boolean;

  withConverter(): DocumentReference;

  onSnapshot(callback: () => void, errorCallback: () => void): () => void;
  onSnapshot(options: Record<string, never>, callback: () => void, errorCallback: () => void): () => void;

  /** @deprecated Call the analagous method on a `Query` instance instead. */
  orderBy(): never;

  /** @deprecated Call the analagous method on a `Query` instance instead. */
  limit(): never;

  /** @deprecated Call the analagous method on a `Query` instance instead. */
  offset(): never;

  /** @deprecated Call the analagous method on a `Query` instance instead. */
  startAfter(): never;

  /** @deprecated Call the analagous method on a `Query` instance instead. */
  startAt(): never;
}

export declare class CollectionReference extends Query {
  id: string;
  parent: DocumentReference;
  path: string;

  constructor(id: string, parent: DocumentReference, firestore?: FakeFirestore);

  doc(id?: string): DocumentReference;
  get(): Promise<MockedQuerySnapshot>;
  add(data: DocumentData): Promise<DocumentReference>;
  isEqual(other: CollectionReference): boolean;

  /**
   * An internal method, meant mainly to be used by `get` and other internal objects to retrieve
   * the list of database records referenced by this CollectionReference.
   * @returns An array of mocked document records.
   */
  private _records(): Array<MockedDocument>
}
