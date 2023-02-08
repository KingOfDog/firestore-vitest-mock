import { vi } from 'vitest';

import defaultOptions from './helpers/defaultMockOptions';

export const mockInitializeApp = vi.fn();
export const mockCert = vi.fn();

export const firebaseStub = async (overrides, options = defaultOptions) => {
  const { FakeFirestore, FakeAuth, Query, CollectionReference, DocumentReference, FieldValue, Timestamp, Transaction, FieldPath } = await import('firestore-vitest-mock');

  // Prepare namespaced classes
  function firestoreConstructor() {
    return new FakeFirestore(overrides.database, options);
  }

  firestoreConstructor.Query = Query;
  firestoreConstructor.CollectionReference = CollectionReference;
  firestoreConstructor.DocumentReference = DocumentReference;
  firestoreConstructor.FieldValue = FieldValue;
  firestoreConstructor.Timestamp = Timestamp;
  firestoreConstructor.Transaction = Transaction;
  firestoreConstructor.FieldPath = FieldPath;

  //Remove methods which do not exist in Firebase
  delete DocumentReference.prototype.listCollections;

  // The Firebase mock
  return {
    initializeApp: mockInitializeApp,

    credential: {
      cert: mockCert,
    },

    auth() {
      return new FakeAuth(overrides.currentUser);
    },

    firestore: firestoreConstructor,
  };
};

export const mockFirebase = (overrides = {}, options = defaultOptions) => {
  mockModuleIfFound('firebase', overrides, options);
  mockModuleIfFound('firebase-admin', overrides, options);
};

async function mockModuleIfFound(moduleName, overrides, options) {
  try {
    // await import.meta.resolve(moduleName);
    vi.doMock(moduleName, () => firebaseStub(overrides, options));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.info(`Module ${moduleName} not found, mocking skipped.`);
  }
}
