import type { Mock } from 'vitest';
import type { FirebaseUser, FakeAuth } from './auth';
import type { FakeFirestore } from './firestore';
import DefaultOptions from './helpers/defaultMockOptions';

export interface DatabaseDocument {
  id: string;
  _collections?: DatabaseCollections;
  [key: string]: unknown;
}

export interface DatabaseCollections {
  [collectionName: string]: Array<DatabaseDocument> | undefined;
}

export type FakeFirestoreDocumentData = Record<string, unknown>;

export interface StubOverrides {
  database?: DatabaseCollections;
  currentUser?: FirebaseUser;
}

export interface StubOptions extends Partial<typeof DefaultOptions> {
  [key: string]: unknown;
}

export interface FirebaseMock {
  initializeApp: Mock;
  credential: {
    cert: Mock;
  };
  auth(): FakeAuth;
  firestore(): FakeFirestore;
}