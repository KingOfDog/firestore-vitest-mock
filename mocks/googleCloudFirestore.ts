import { vi } from "vitest";
import { StubOptions, StubOverrides } from './firebase.model';

import defaultOptions from './helpers/defaultMockOptions';
import type { FakeFirestore, Query, CollectionReference, DocumentReference, FieldValue, Timestamp, Transaction, FieldPath } from "..";

declare class Firestore extends FakeFirestore {
  constructor();
}

interface GCloudFirestoreMock {
  Firestore: typeof Firestore;
  Query: typeof Query;
  CollectionReference: typeof CollectionReference;
  DocumentReference: typeof DocumentReference;
  FieldValue: typeof FieldValue;
  FieldPath: typeof FieldPath;
  Timestamp: typeof Timestamp;
  Transaction: typeof Transaction;
}

export const firestoreStub = async (overrides?: StubOverrides, options: StubOptions = defaultOptions): Promise<GCloudFirestoreMock> => {
  const { FakeFirestore, Query, CollectionReference, DocumentReference, FieldValue, Timestamp, Transaction, FieldPath } = await import("firestore-vitest-mock");

  class Firestore extends FakeFirestore {
    constructor() {
      super(overrides?.database, options);
    }
  }
  return {
    Query,
    CollectionReference,
    DocumentReference,
    FieldValue,
    FieldPath,
    Timestamp,
    Transaction,
    Firestore
  };
};

export const mockGoogleCloudFirestore = (overrides?: StubOverrides, options: StubOptions = defaultOptions): void => {
  mockModuleIfFound("@google-cloud/firestore", overrides, options);
};

function mockModuleIfFound(moduleName: string, overrides?: StubOverrides, options?: StubOptions) {
  try {
    require.resolve(moduleName);
    vi.doMock(moduleName, () => firestoreStub(overrides, options));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.info(`Module ${moduleName} not found, mocking skipped.`);
  }
}
