import { type DocumentReference } from "../firestore";
import { type FakeFirestoreDatabase } from "../firestore.model";
import { type Timestamp } from "../timestamp";

export type DocumentData = Record<string, unknown>;

export interface DocumentHash extends DocumentData {
  id?: string;
  _collections: FakeFirestoreDatabase;
  _createTime?: Timestamp;
  _readTime?: Timestamp;
  _ref: DocumentReference;
  _updateTime?: Timestamp;
}

export interface MockedDocument<T = DocumentData> {
  createTime: Timestamp;
  exists: boolean;
  id: string;
  readTime: Timestamp;
  ref: DocumentReference;
  metadata: {
    hasPendingWrites: "Server";
  };
  updateTime: Timestamp;
  data: () => T | undefined;
  get: (fieldPath: string) => unknown;
}
