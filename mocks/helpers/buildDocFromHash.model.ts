import type { FakeFirestore, FakeFirestoreDatabase } from '../firestore.model';

export type DocumentData = { [field: string]: unknown };

export interface DocumentHash extends DocumentData {
  id?: string;
  _collections: FakeFirestoreDatabase;
  _createTime?: typeof Timestamp;
  _readTime?: typeof Timestamp;
  _ref: typeof DocumentReference;
  _updateTime?: typeof Timestamp;
}

export interface MockedDocument<T = DocumentData> {
  createTime: typeof Timestamp;
  exists: boolean;
  id: string;
  readTime: typeof Timestamp;
  ref: typeof DocumentReference;
  metadata: {
    hasPendingWrites: 'Server';
  };
  updateTime: typeof Timestamp;
  data(): T | undefined;
  get(fieldPath: string): unknown;
}
