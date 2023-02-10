import { vi } from "vitest";

import * as query from "./query";
import * as timestamp from "./timestamp";
import * as transaction from "./transaction";

import {
  type DatabaseCollections,
  type DatabaseDocument,
  type FakeFirestoreDatabase,
  type FirestoreBatch,
} from "./firestore.model";
import buildDocFromHash from "./helpers/buildDocFromHash";
import {
  type DocumentData,
  type DocumentHash,
  type MockedDocument,
} from "./helpers/buildDocFromHash.model";
import buildQuerySnapShot from "./helpers/buildQuerySnapShot";
import { type MockedQuerySnapshot } from "./helpers/buildQuerySnapShot.model";
import { Query } from "./query";
import { Transaction } from "./transaction";

export * from "./fieldValue";
export * from "./path";
export * from "./query";
export * from "./timestamp";
export * from "./transaction";

export const mockCollectionGroup = vi.fn();
export const mockBatch = vi.fn();
export const mockRunTransaction = vi.fn();

export const mockSettings = vi.fn();
export const mockUseEmulator = vi.fn();
export const mockCollection = vi.fn();
export const mockDoc = vi.fn();
export const mockUpdate = vi.fn();
export const mockSet = vi.fn();
export const mockAdd = vi.fn();
export const mockDelete = vi.fn();
export const mockListDocuments = vi.fn();
export const mockListCollections = vi.fn();

export const mockBatchDelete = vi.fn();
export const mockBatchCommit = vi.fn();
export const mockBatchUpdate = vi.fn();
export const mockBatchSet = vi.fn();

export const mockOnSnapShot = vi.fn();

const _randomId = (): string =>
  Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString();

export class FakeFirestore {
  database: FakeFirestoreDatabase;
  options: Record<string, unknown>;
  query: Query;

  constructor(
    stubbedDatabase: FakeFirestoreDatabase = {},
    options: Record<string, unknown> = {}
  ) {
    this.database = timestamp.convertTimestamps(
      stubbedDatabase
    ) as FakeFirestoreDatabase;
    this.query = new query.Query("", this);
    this.options = options;
  }

  set collectionName(collectionName: string) {
    this.query.collectionName = collectionName;
  }

  get collectionName(): string {
    return this.query.collectionName;
  }

  async getAll(
    ...params: Array<DocumentReference | unknown>
  ): Promise<MockedQuerySnapshot[]> {
    // Strip ReadOptions object
    const references = params.filter(
      (arg) => arg instanceof DocumentReference
    ) as DocumentReference[];

    return await Promise.all(
      transaction.mockGetAll(...references) ??
        [...references].map(async (r) => await r.get())
    );
  }

  batch(): FirestoreBatch {
    mockBatch(...arguments);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    return {
      _ref: this,
      delete() {
        mockBatchDelete(...arguments);
        return this;
      },
      set(doc, data, setOptions = {}) {
        mockBatchSet(...arguments);
        this._ref._updateData(doc.path, data, setOptions.merge);
        return this;
      },
      update(doc, data) {
        mockBatchUpdate(...arguments);
        this._ref._updateData(doc.path, data, true);
        return this;
      },
      async commit() {
        mockBatchCommit(...arguments);
        return await Promise.resolve([]);
      },
    };
  }

  settings(): void {
    mockSettings(...arguments);
  }

  useEmulator(): void {
    mockUseEmulator(...arguments);
  }

  collection(path: string): CollectionReference {
    // Accept any collection path
    // See https://firebase.google.com/docs/reference/js/firebase.firestore.Firestore#collection
    mockCollection(...arguments);

    if (path === undefined) {
      throw new Error(
        `FakeFirebaseError: Function Firestore.collection() requires 1 argument, but was called with 0 arguments.`
      );
    } else if (!path || typeof path !== "string") {
      throw new Error(
        `FakeFirebaseError: Function Firestore.collection() requires its first argument to be of type non-empty string, but it was: ${JSON.stringify(
          path
        )}`
      );
    }

    // Ignore leading slash
    const pathArray = path.replace(/^\/+/, "").split("/");
    // Must be collection-level, so odd-numbered elements
    if (pathArray.length % 2 !== 1) {
      throw new Error(
        `FakeFirebaseError: Invalid collection reference. Collection references must have an odd number of segments, but ${path} has ${pathArray.length}`
      );
    }

    const { coll } = this._docAndColForPathArray(pathArray);
    return coll;
  }

  collectionGroup(collectionId: string): Query {
    mockCollectionGroup(...arguments);
    return new Query(collectionId, this, true);
  }

  doc(path: string): DocumentReference {
    mockDoc(path);
    return this._doc(path);
  }

  _doc(path: string): DocumentReference {
    // Accept any document path
    // See https://firebase.google.com/docs/reference/js/firebase.firestore.Firestore#doc

    if (path === undefined) {
      throw new Error(
        `FakeFirebaseError: Function Firestore.doc() requires 1 argument, but was called with 0 arguments.`
      );
    } else if (!path || typeof path !== "string") {
      throw new Error(
        `FakeFirebaseError: Function Firestore.doc() requires its first argument to be of type non-empty string, but it was: ${JSON.stringify(
          path
        )}`
      );
    }

    // Ignore leading slash
    const pathArray = path.replace(/^\/+/, "").split("/");
    // Must be document-level, so even-numbered elements
    if (pathArray.length % 2 !== 0) {
      throw new Error(`FakeFirebaseError: Invalid document reference. Document references must have an even number of segments, but ${path} has ${pathArray.length}
      `);
    }

    const { doc } = this._docAndColForPathArray(pathArray);
    return doc;
  }

  _docAndColForPathArray(pathArray: string[]): {
    doc: DocumentReference;
    coll: CollectionReference;
  } {
    let doc = null;
    let coll = null;
    for (let index = 0; index < pathArray.length; index += 2) {
      const collectionId = pathArray[index] || "";
      const documentId = pathArray[index + 1] || "";

      coll = new CollectionReference(collectionId, doc ?? undefined, this);
      if (!documentId) {
        break;
      }
      doc = new DocumentReference(documentId, coll);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return { doc: doc!, coll: coll! };
  }

  async runTransaction<T>(
    updateFunction: (transaction: Transaction) => Promise<T>
  ): Promise<T> {
    mockRunTransaction(...arguments);
    return await updateFunction(new Transaction());
  }

  _updateData(path: string, object: DocumentData, merge = false): void {
    // Do not update unless explicity set to mutable.
    if (!this.options.mutable) {
      return;
    }

    // note: this logic could be deduplicated
    const pathArray = path.replace(/^\/+/, "").split("/");

    // Must be document-level, so even-numbered elements
    if (pathArray.length % 2 !== 0) {
      throw new Error(
        `FakeFirebaseError: Invalid document reference. Document references must have an even number of segments, but ${path} has ${pathArray.length}`
      );
    }

    // The parent entry is the id of the document
    const docId = pathArray.pop() ?? "";
    // Find the parent of docId. Run through the path, creating missing entries
    const parent: DatabaseDocument[] = pathArray.reduce(
      (last: DatabaseCollections | DatabaseDocument[], entry, index) => {
        const isCollection = index % 2 === 0;
        if (isCollection) {
          last = last as DatabaseCollections;
          return last[entry] ?? (last[entry] = []);
        } else {
          last = last as DatabaseDocument[];
          const existingDoc = last.find((doc) => doc.id === entry);
          if (existingDoc != null) {
            // return _collections, creating it if it doesn't already exist
            return existingDoc._collections ?? (existingDoc._collections = {});
          }

          const _collections = {};
          last.push({ id: entry, _collections });
          return _collections;
        }
      },
      this.database
    ) as DatabaseDocument[];

    // parent should now be an array of documents
    // Replace existing data, if it's there, or add to the end of the array
    const oldIndex = parent.findIndex((doc) => doc.id === docId);
    parent[oldIndex >= 0 ? oldIndex : parent.length] = {
      ...(merge ? parent[oldIndex] : undefined),
      ...object,
      id: docId,
    };
  }
}

type SnapshotCallback = (snapshot: MockedDocument) => void;
type ErrorCallback = (error: unknown) => void;

/*
 * ============
 *  Document Reference
 * ============
 */

export class DocumentReference {
  public firestore: FakeFirestore;
  public path: string;

  constructor(
    public id: string,
    public parent: CollectionReference,
    firestore?: FakeFirestore
  ) {
    this.firestore = firestore ?? parent.firestore;
    this.path = parent.path.split("/").concat(id).join("/");
  }

  collection(collectionName: string): CollectionReference {
    mockCollection(...arguments);
    return new CollectionReference(collectionName, this);
  }

  async listCollections(): Promise<CollectionReference[]> {
    mockListCollections();

    const document = this._getRawObject();
    if (document?._collections == null) {
      return await Promise.resolve([]);
    }

    const collectionRefs = [];
    for (const collectionId of Object.keys(document._collections)) {
      collectionRefs.push(new CollectionReference(collectionId, this));
    }

    return await Promise.resolve(collectionRefs);
  }

  async delete(): Promise<void> {
    mockDelete(...arguments);
  }

  onSnapshot(
    callback: SnapshotCallback,
    errorCallback: ErrorCallback
  ): () => void;
  onSnapshot(
    options: Record<string, never>,
    callback: SnapshotCallback,
    errorCallback: ErrorCallback
  ): () => void;
  onSnapshot(
    a: SnapshotCallback | Record<string, never>,
    b: SnapshotCallback | ErrorCallback,
    c?: ErrorCallback
  ): () => void {
    mockOnSnapShot(...arguments);
    const callback: SnapshotCallback = typeof a === "function" ? a : b;
    const errorCallback: ErrorCallback = c ?? (b as ErrorCallback);

    try {
      callback(this._get());
    } catch (e) {
      if (errorCallback) {
        errorCallback(e);
      } else {
        throw e;
      }
    }

    // Returns an unsubscribe function
    return () => {};
  }

  async get(): Promise<MockedDocument> {
    query.mockGet(...arguments);
    const data = this._get();
    return await Promise.resolve(data);
  }

  async update(object: DocumentData): Promise<MockedDocument> {
    mockUpdate(...arguments);
    if (this._get().exists) {
      this.firestore._updateData(this.path, object, true);
    }
    return await Promise.resolve(
      buildDocFromHash({
        ...object,
        _ref: this,
        _updateTime: timestamp.Timestamp.now(),
      } as unknown as DocumentHash)
    );
  }

  async set(
    object: DocumentData,
    setOptions: { merge: boolean } = { merge: false }
  ): Promise<MockedDocument> {
    mockSet(...arguments);
    this.firestore._updateData(this.path, object, setOptions.merge);
    return await Promise.resolve(
      buildDocFromHash({
        ...object,
        _ref: this,
        _updateTime: timestamp.Timestamp.now(),
      } as unknown as DocumentHash)
    );
  }

  isEqual(other: DocumentReference): boolean {
    return (
      other instanceof DocumentReference &&
      other.firestore === this.firestore &&
      other.path === this.path
    );
  }

  /**
   * A private method for internal use.
   */
  _getRawObject(): DatabaseDocument | null {
    // Ignore leading slash
    const pathArray = this.path.replace(/^\/+/, "").split("/");

    if (pathArray[0] === "database") {
      pathArray.shift(); // drop 'database'; it was included in legacy paths, but we don't need it now
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let requestedRecords = this.firestore.database[pathArray.shift()!];
    let document = null;
    if (requestedRecords != null) {
      const documentId = pathArray.shift();
      document = requestedRecords.find((record) => record.id === documentId);
    } else {
      return null;
    }

    for (let index = 0; index < pathArray.length; index += 2) {
      const collectionId = pathArray[index];
      const documentId = pathArray[index + 1];

      if (document == null || document._collections == null) {
        return null;
      }
      requestedRecords = document._collections[collectionId] ?? [];
      if (requestedRecords.length === 0) {
        return null;
      }

      document = requestedRecords.find((record) => record.id === documentId);
      if (document == null) {
        return null;
      }

      // +2 skips to next document
    }

    if (!(document == null) || false) {
      return document;
    }
    return null;
  }

  _get(): MockedDocument {
    const document = this._getRawObject();

    if (document != null) {
      document._ref = this;
      document._readTime = timestamp.Timestamp.now();
      return buildDocFromHash(document as DocumentHash);
    } else {
      return {
        createTime: undefined,
        exists: false,
        data: () => undefined,
        id: this.id,
        readTime: undefined,
        ref: this,
        updateTime: undefined,
      } as unknown as MockedDocument;
    }
  }

  withConverter(): this {
    query.mockWithConverter(...arguments);
    return this;
  }
}

/*
 * ============
 *  Collection Reference
 * ============
 */

export class CollectionReference extends Query {
  public path: string;
  public firestore: FakeFirestore;

  constructor(
    public id: string,
    public parent?: DocumentReference,
    firestore?: FakeFirestore
  ) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    super(id, (firestore ?? parent?.firestore)!);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.firestore = (firestore ?? parent?.firestore)!;

    if (parent != null) {
      this.path = parent.path.concat(`/${id}`);
    } else {
      this.path = id;
    }
  }

  async add(object: DocumentData): Promise<DocumentReference> {
    mockAdd(...arguments);
    const newDoc = new DocumentReference(_randomId(), this);
    this.firestore._updateData(newDoc.path, object);
    return await Promise.resolve(newDoc);
  }

  doc(id: string = _randomId()): DocumentReference {
    mockDoc(id);
    return new DocumentReference(id, this, this.firestore);
  }

  /**
   * A private method, meant mainly to be used by `get` and other internal objects to retrieve
   * the list of database records referenced by this CollectionReference.
   * @returns {Object[]} An array of mocked document records.
   */
  _records(): DatabaseDocument[] {
    // Ignore leading slash
    const pathArray = this.path.replace(/^\/+/, "").split("/");

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let requestedRecords = this.firestore.database[pathArray.shift()!];
    if (pathArray.length === 0) {
      return requestedRecords ?? [];
    }

    // Since we're a collection, we can assume that pathArray.length % 2 is always 0

    for (let index = 0; index < pathArray.length; index += 2) {
      const documentId = pathArray[index];
      const collectionId = pathArray[index + 1];

      if (requestedRecords == null) {
        return [];
      }
      const document = requestedRecords.find(
        (record) => record.id === documentId
      );
      if (document == null || document._collections == null) {
        return [];
      }

      requestedRecords = document._collections[collectionId] ?? [];
      if (requestedRecords.length === 0) {
        return [];
      }

      // +2 skips to next collection
    }
    return requestedRecords ?? [];
  }

  async listDocuments(): Promise<DocumentReference[]> {
    mockListDocuments();
    // Returns all documents, including documents with no data but with
    // subcollections: see https://googleapis.dev/nodejs/firestore/latest/CollectionReference.html#listDocuments
    return await Promise.resolve(
      this._records().map(
        (rec) => new DocumentReference(rec.id, this, this.firestore)
      )
    );
  }

  async get(): Promise<MockedQuerySnapshot> {
    query.mockGet(...arguments);
    return await Promise.resolve(this._get());
  }

  _get(): MockedQuerySnapshot {
    // Make sure we have a 'good enough' document reference
    const records: DocumentHash[] = this._records().map((rec) => ({
      ...rec,
      _ref: new DocumentReference(rec.id, this, this.firestore),
    })) as DocumentHash[];
    // Firestore does not return documents with no local data
    const isFilteringEnabled = this.firestore.options.simulateQueryFilters;
    return buildQuerySnapShot(
      records,
      isFilteringEnabled ? this.filters : undefined,
      this.selectFields
    );
  }

  isEqual(other: CollectionReference): boolean {
    return (
      other instanceof CollectionReference &&
      other.firestore === this.firestore &&
      other.path === this.path
    );
  }
}
