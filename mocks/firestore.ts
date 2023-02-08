import { vi } from "vitest";

import * as timestamp from "./timestamp";
import * as fieldValue from "./fieldValue";
import * as query from "./query";
import * as transaction from "./transaction";
import * as path from "./path";

import buildDocFromHash from "./helpers/buildDocFromHash";
import buildQuerySnapShot from "./helpers/buildQuerySnapShot";
import { Query } from './query';
import { MockedQuerySnapshot } from './helpers/buildQuerySnapShot.model';
import { Transaction } from './transaction';

export * from './query';
export * from './transaction';
export * from './timestamp';
export * from './fieldValue';
export * from './path';

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

const _randomId = () =>
  Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString();

export class FakeFirestore {
  database: FakeFirestoreDatabase;
  options: Record<string, never>;
  query: Query;

  constructor(stubbedDatabase: FakeFirestoreDatabase = {}, options: Record<string, never> = {}) {
    this.database = timestamp.convertTimestamps(stubbedDatabase) as FakeFirestoreDatabase;
    this.query = new query.Query("", this);
    this.options = options;
  }

  set collectionName(collectionName: string) {
    this.query.collectionName = collectionName;
    this.recordToFetch = null;
  }

  get collectionName(): string {
    return this.query.collectionName;
  }

  getAll(...params): Promise<Array<MockedQuerySnapshot>> {
    //Strip ReadOptions object
    params = params.filter(
      arg => arg instanceof DocumentReference
    );

    return Promise.all(
      transaction.mockGetAll(...params) || [...params].map(r => r.get())
    );
  }

  batch(): FirestoreBatch {
    mockBatch(...arguments);
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
      commit() {
        mockBatchCommit(...arguments);
        return Promise.resolve([]);
      }
    };
  }

  settings(): void {
    mockSettings(...arguments);
    return;
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

  _docAndColForPathArray(pathArray: string[]): { doc: DocumentReference, coll: CollectionReference } {
    let doc = null;
    let coll = null;
    for (let index = 0; index < pathArray.length; index += 2) {
      const collectionId = pathArray[index] || "";
      const documentId = pathArray[index + 1] || "";

      coll = new CollectionReference(collectionId, doc, this);
      if (!documentId) {
        break;
      }
      doc = new DocumentReference(documentId, coll);
    }

    return { doc, coll };
  }

  runTransaction(updateFunction) {
    mockRunTransaction(...arguments);
    return updateFunction(new Transaction());
  }

  _updateData(path, object, merge) {
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
    const docId = pathArray.pop();
    // Find the parent of docId. Run through the path, creating missing entries
    const parent = pathArray.reduce((last, entry, index) => {
      const isCollection = index % 2 === 0;
      if (isCollection) {
        return last[entry] || (last[entry] = []);
      } else {
        const existingDoc = last.find(doc => doc.id === entry);
        if (existingDoc) {
          // return _collections, creating it if it doesn't already exist
          return existingDoc._collections || (existingDoc._collections = {});
        }

        const _collections = {};
        last.push({ id: entry, _collections });
        return _collections;
      }
    }, this.database);

    // parent should now be an array of documents
    // Replace existing data, if it's there, or add to the end of the array
    const oldIndex = parent.findIndex(doc => doc.id === docId);
    parent[oldIndex >= 0 ? oldIndex : parent.length] = {
      ...(merge ? parent[oldIndex] : undefined),
      ...object,
      id: docId
    };
  }
}

/*
 * ============
 *  Document Reference
 * ============
 */

export class DocumentReference {
  constructor(id, parent) {
    this.id = id;
    this.parent = parent;
    this.firestore = parent.firestore;
    this.path = parent.path
      .split("/")
      .concat(id)
      .join("/");
  }

  collection(collectionName) {
    mockCollection(...arguments);
    return new CollectionReference(collectionName, this);
  }

  listCollections() {
    mockListCollections();

    const document = this._getRawObject();
    if (!document._collections) {
      return Promise.resolve([]);
    }

    const collectionRefs = [];
    for (const collectionId of Object.keys(document._collections)) {
      collectionRefs.push(
        new CollectionReference(collectionId, this)
      );
    }

    return Promise.resolve(collectionRefs);
  }

  delete() {
    mockDelete(...arguments);
    return Promise.resolve();
  }

  onSnapshot() {
    mockOnSnapShot(...arguments);
    let callback;
    let errorCallback;
    // eslint-disable-next-line
    let options;

    try {
      if (typeof arguments[0] === "function") {
        [callback, errorCallback] = arguments;
      } else {
        // eslint-disable-next-line no-unused-vars
        [options, callback, errorCallback] = arguments;
      }

      callback(this._get());
    } catch (e) {
      if (errorCallback) {
        errorCallback(e);
      } else {
        throw e;
      }
    }

    // Returns an unsubscribe function
    return () => { };
  }

  get() {
    query.mockGet(...arguments);
    const data = this._get();
    return Promise.resolve(data);
  }

  update(object) {
    mockUpdate(...arguments);
    if (this._get().exists) {
      this.firestore._updateData(this.path, object, true);
    }
    return Promise.resolve(
      buildDocFromHash({
        ...object,
        _ref: this,
        _updateTime: timestamp.Timestamp.now()
      })
    );
  }

  set(object, setOptions = {}) {
    mockSet(...arguments);
    this.firestore._updateData(this.path, object, setOptions.merge);
    return Promise.resolve(
      buildDocFromHash({
        ...object,
        _ref: this,
        _updateTime: timestamp.Timestamp.now()
      })
    );
  }

  isEqual(other) {
    return (
      other instanceof DocumentReference &&
      other.firestore === this.firestore &&
      other.path === this.path
    );
  }

  orderBy() {
    return this.query.orderBy(...arguments);
  }

  limit() {
    return this.query.limit(...arguments);
  }

  offset() {
    return this.query.offset(...arguments);
  }

  startAfter() {
    return this.query.startAfter(...arguments);
  }

  startAt() {
    return this.query.startAt(...arguments);
  }

  /**
   * A private method for internal use.
   * @returns {Object|null} The raw object of the document or null.
   */
  _getRawObject() {
    // Ignore leading slash
    const pathArray = this.path.replace(/^\/+/, "").split("/");

    if (pathArray[0] === "database") {
      pathArray.shift(); // drop 'database'; it was included in legacy paths, but we don't need it now
    }

    let requestedRecords = this.firestore.database[pathArray.shift()];
    let document = null;
    if (requestedRecords) {
      const documentId = pathArray.shift();
      document = requestedRecords.find(record => record.id === documentId);
    } else {
      return null;
    }

    for (let index = 0; index < pathArray.length; index += 2) {
      const collectionId = pathArray[index];
      const documentId = pathArray[index + 1];

      if (!document || !document._collections) {
        return null;
      }
      requestedRecords = document._collections[collectionId] || [];
      if (requestedRecords.length === 0) {
        return null;
      }

      document = requestedRecords.find(record => record.id === documentId);
      if (!document) {
        return null;
      }

      // +2 skips to next document
    }

    if (!!document || false) {
      return document;
    }
    return null;
  }

  _get() {
    const document = this._getRawObject();

    if (document) {
      document._ref = this;
      document._readTime = timestamp.Timestamp.now();
      return buildDocFromHash(document);
    } else {
      return {
        createTime: undefined,
        exists: false,
        data: () => undefined,
        id: this.id,
        readTime: undefined,
        ref: this,
        updateTime: undefined
      };
    }
  }

  withConverter() {
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
  constructor(id, parent, firestore) {
    super(id, firestore || parent.firestore);

    this.id = id;
    this.parent = parent;
    if (parent) {
      this.path = parent.path.concat(`/${id}`);
    } else {
      this.path = id;
    }
  }

  add(object) {
    mockAdd(...arguments);
    const newDoc = new DocumentReference(_randomId(), this);
    this.firestore._updateData(newDoc.path, object);
    return Promise.resolve(newDoc);
  }

  doc(id = _randomId()) {
    mockDoc(id);
    return new DocumentReference(id, this, this.firestore);
  }

  /**
   * A private method, meant mainly to be used by `get` and other internal objects to retrieve
   * the list of database records referenced by this CollectionReference.
   * @returns {Object[]} An array of mocked document records.
   */
  _records() {
    // Ignore leading slash
    const pathArray = this.path.replace(/^\/+/, "").split("/");

    let requestedRecords = this.firestore.database[pathArray.shift()];
    if (pathArray.length === 0) {
      return requestedRecords || [];
    }

    // Since we're a collection, we can assume that pathArray.length % 2 is always 0

    for (let index = 0; index < pathArray.length; index += 2) {
      const documentId = pathArray[index];
      const collectionId = pathArray[index + 1];

      if (!requestedRecords) {
        return [];
      }
      const document = requestedRecords.find(
        record => record.id === documentId
      );
      if (!document || !document._collections) {
        return [];
      }

      requestedRecords = document._collections[collectionId] || [];
      if (requestedRecords.length === 0) {
        return [];
      }

      // +2 skips to next collection
    }
    return requestedRecords;
  }

  listDocuments() {
    mockListDocuments();
    // Returns all documents, including documents with no data but with
    // subcollections: see https://googleapis.dev/nodejs/firestore/latest/CollectionReference.html#listDocuments
    return Promise.resolve(
      this._records().map(
        rec => new DocumentReference(rec.id, this, this.firestore)
      )
    );
  }

  get() {
    query.mockGet(...arguments);
    return Promise.resolve(this._get());
  }

  _get() {
    // Make sure we have a 'good enough' document reference
    const records = this._records().map(rec => ({
      ...rec,
      _ref: new DocumentReference(rec.id, this, this.firestore)
    }));
    // Firestore does not return documents with no local data
    const isFilteringEnabled = this.firestore.options.simulateQueryFilters;
    return buildQuerySnapShot(
      records,
      isFilteringEnabled ? this.filters : undefined,
      this.selectFields
    );
  }

  isEqual(other) {
    return (
      other instanceof CollectionReference &&
      other.firestore === this.firestore &&
      other.path === this.path
    );
  }
}
