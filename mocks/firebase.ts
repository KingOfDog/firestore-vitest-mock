import { vi } from "vitest";
import {
  type FirebaseMock,
  type StubOptions,
  type StubOverrides,
} from "./firebase.model";
import { type FakeFirestore } from "./firestore";

import defaultOptions from "./helpers/defaultMockOptions";

export const mockInitializeApp = vi.fn();
export const mockCert = vi.fn();

export const firebaseStub = async (
  overrides?: StubOverrides,
  options: StubOptions = defaultOptions
): Promise<FirebaseMock> => {
  const {
    FakeFirestore,
    FakeAuth,
    FakeMessaging,
    Query,
    CollectionReference,
    DocumentReference,
    FieldValue,
    Timestamp,
    Transaction,
    FieldPath,
  } = await import("firestore-vitest-mock");

  // Prepare namespaced classes
  function firestoreConstructor(): FakeFirestore {
    return new FakeFirestore(overrides?.database, options);
  }

  firestoreConstructor.Query = Query;
  firestoreConstructor.CollectionReference = CollectionReference;
  firestoreConstructor.DocumentReference = DocumentReference;
  firestoreConstructor.FieldValue = FieldValue;
  firestoreConstructor.Timestamp = Timestamp;
  firestoreConstructor.Transaction = Transaction;
  firestoreConstructor.FieldPath = FieldPath;

  // Remove methods which do not exist in Firebase
  // @ts-expect-error The listCollections method is only used internally and should not be exposed to applications
  delete DocumentReference.prototype.listCollections;

  // The Firebase mock
  return {
    initializeApp: mockInitializeApp,

    credential: {
      cert: mockCert,
    },

    auth() {
      return new FakeAuth(overrides?.currentUser);
    },

    messaging() {
      return new FakeMessaging();
    },

    firestore: firestoreConstructor,
  };
};

export const mockFirebase = async (
  overrides?: StubOverrides,
  options: StubOptions = defaultOptions
): Promise<void> => {
  mockModuleIfFound("firebase", overrides, options);
  mockModuleIfFound("firebase-admin", overrides, options);
};

async function mockModuleIfFound(
  moduleName: string,
  overrides?: StubOverrides,
  options?: StubOptions
): Promise<void> {
  try {
    // await import.meta.resolve(moduleName);
    vi.doMock(moduleName, async () => await firebaseStub(overrides, options));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.info(`Module ${moduleName} not found, mocking skipped.`);
  }
}
