import type { Mock } from "vitest";
import type { FirebaseUser, FakeAuth } from "./auth";
import type { FakeFirestore } from "./firestore";
import type DefaultOptions from "./helpers/defaultMockOptions";
import { FakeMessaging } from "./messaging";

export interface DatabaseDocument {
  id: string;
  _collections?: DatabaseCollections;
  [key: string]: unknown;
}

export type DatabaseCollections = Record<
  string,
  DatabaseDocument[] | undefined
>;

export type FakeFirestoreDocumentData = Record<string, unknown>;

export interface StubOverrides {
  database?: DatabaseCollections;
  currentUser?: FirebaseUser;
}

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface StubOptions extends Partial<typeof DefaultOptions> {
  [key: string]: unknown;
}

export interface FirebaseMock {
  initializeApp: Mock;
  credential: {
    cert: Mock;
  };
  auth: () => FakeAuth;
  firestore: () => FakeFirestore;
  messaging: () => FakeMessaging;
}
