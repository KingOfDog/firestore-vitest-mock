import { vi } from "vitest";

import defaultOptions from './helpers/defaultMockOptions';

export const firestoreStub = async (overrides, options = defaultOptions) => {
  const { FakeFirestore, FakeAuth, Query, CollectionReference, DocumentReference, FieldValue, Timestamp, Transaction, FieldPath } = await import("firestore-vitest-mock");

  class Firestore extends FakeFirestore {
    constructor() {
      super(overrides.database, options);
    }
  }
  return {
    Query: Query,
    CollectionReference: CollectionReference,
    DocumentReference: DocumentReference,
    FieldValue: FieldValue,
    FieldPath: FieldPath,
    Timestamp: Timestamp,
    Transaction: Transaction,
    /** @type {Firestore.constructor} */
    Firestore
  };
};

export const mockGoogleCloudFirestore = (overrides = {}, options = defaultOptions) => {
  mockModuleIfFound("@google-cloud/firestore", overrides, options);
};

function mockModuleIfFound(moduleName, overrides, options) {
  try {
    require.resolve(moduleName);
    vi.doMock(moduleName, () => firestoreStub(overrides, options));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.info(`Module ${moduleName} not found, mocking skipped.`);
  }
}
