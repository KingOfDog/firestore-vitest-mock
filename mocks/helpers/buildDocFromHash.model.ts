import { DocumentReference } from '../firestore';
import { FakeFirestoreDatabase } from '../firestore.model';
import { Timestamp } from '../timestamp';

export type DocumentData = { [field: string]: unknown };

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
    hasPendingWrites: 'Server';
  };
  updateTime: Timestamp;
  data(): T | undefined;
  get(fieldPath: string): unknown;
}
