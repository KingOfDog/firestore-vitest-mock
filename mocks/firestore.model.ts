import { type DocumentReference, type FakeFirestore } from "./firestore";
import { type DocumentData } from "./helpers/buildDocFromHash.model";

export interface DatabaseDocument extends DocumentData {
  id: string;
  _collections?: DatabaseCollections;
}

export type DatabaseCollections = Record<
  string,
  DatabaseDocument[] | undefined
>;

export interface SetOptions {
  merge?: boolean;
}

export interface FirestoreBatch {
  _ref: FakeFirestore;
  delete: () => FirestoreBatch;
  set: (
    doc: DocumentReference,
    data: DocumentData,
    options?: SetOptions
  ) => FirestoreBatch;
  update: (doc: DocumentReference, data: DocumentData) => FirestoreBatch;
  commit: () => Promise<[]>;
}

export type FakeFirestoreDatabase = DatabaseCollections;
