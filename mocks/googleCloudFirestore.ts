import { vi } from "vitest";
import { FieldValue } from './fieldValue';
import { StubOptions, StubOverrides } from './firebase.model';
import { FakeFirestore } from './firestore';
import { CollectionReference, DocumentReference } from './firestore.model';

import defaultOptions from './helpers/defaultMockOptions';
import { FieldPath } from './path';
import { Query } from './query';
import { Timestamp } from './timestamp';
import { Transaction } from './transaction';

declare class Firestore extends FakeFirestore {
  constructor();
}

interface GCloudFirestoreMock {
  Firestore: Firestore;
  Query: Query;
  CollectionReference: CollectionReference;
  DocumentReference: DocumentReference;
  FieldValue: FieldValue;
  FieldPath: FieldPath;
  Timestamp: Timestamp;
  Transaction: Transaction;
}

export const firestoreStub = async (overrides?: StubOverrides, options: StubOptions = defaultOptions): Promise<GCloudFirestoreMock> => {
  const { FakeFirestore, Query, CollectionReference, DocumentReference, FieldValue, Timestamp, Transaction, FieldPath } = await import("firestore-vitest-mock");

  class Firestore extends FakeFirestore {
    constructor() {
      super(overrides?.database, options);
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

export const mockGoogleCloudFirestore = (overrides?: StubOverrides, options: StubOptions = defaultOptions) => {
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
