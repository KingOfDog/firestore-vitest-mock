import { vi } from "vitest";
import { type FakeFirestore } from "./firestore";
import { type DocumentHash } from "./helpers/buildDocFromHash.model";

import buildQuerySnapShot from "./helpers/buildQuerySnapShot";
import {
  type Comparator,
  type MockedQuerySnapshot,
  type QueryFilter,
} from "./helpers/buildQuerySnapShot.model";

export const mockGet = vi.fn();
export const mockSelect = vi.fn();
export const mockWhere = vi.fn();
export const mockLimit = vi.fn();
export const mockOrderBy = vi.fn();
export const mockOffset = vi.fn();
export const mockStartAfter = vi.fn();
export const mockStartAt = vi.fn();
export const mockQueryOnSnapshot = vi.fn();
export const mockWithConverter = vi.fn();

export class Query {
  protected filters: QueryFilter[] = [];
  protected selectFields?: string[];

  constructor(
    public collectionName: string,
    public firestore: FakeFirestore,
    public isGroupQuery = false
  ) {}

  async get(): Promise<MockedQuerySnapshot> {
    mockGet(...arguments);
    return await Promise.resolve(this._get());
  }

  _get(): MockedQuerySnapshot {
    // Simulate collectionGroup query

    // Get Firestore collections whose name match `this.collectionName`; return their documents
    const requestedRecords: DocumentHash[] = [];

    const queue = [
      {
        lastParent: "",
        collections: this.firestore.database,
      },
    ];

    let entry;
    while ((entry = queue.shift()) != null) {
      // Get a collection
      const { lastParent, collections } = entry;

      Object.entries(collections).forEach(([collectionPath, docs]) => {
        const prefix = lastParent ? `${lastParent}/` : "";

        const newLastParent = `${prefix}${collectionPath}`;
        const lastPathComponent = collectionPath.split("/").pop();

        // If this is a matching collection, grep its documents
        if (lastPathComponent === this.collectionName) {
          const docHashes =
            docs?.map((doc) => {
              // Fetch the document from the mock db
              const path = `${newLastParent}/${doc.id}`;
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              return {
                ...doc,
                _ref: this.firestore._doc(path),
              } as DocumentHash;
            }) ?? [];
          requestedRecords.push(...docHashes);
        }

        // Enqueue adjacent collections for next run
        docs?.forEach((doc) => {
          if (doc._collections != null) {
            queue.push({
              lastParent: `${prefix}${collectionPath}/${doc.id}`,
              collections: doc._collections,
            });
          }
        });
      });
    }

    // Return the requested documents
    const isFilteringEnabled = this.firestore.options.simulateQueryFilters;
    return buildQuerySnapShot(
      requestedRecords,
      isFilteringEnabled ? this.filters : undefined,
      this.selectFields
    );
  }

  select(...fieldPaths: string[]): Query {
    this.selectFields = fieldPaths;
    return mockSelect(...fieldPaths) || this;
  }

  where(key: string, comp: Comparator, value: string): Query {
    const result = mockWhere(...arguments);
    if (result) {
      return result;
    }

    // Firestore has been tested to throw an error at this point when trying to compare null as a quantity
    if (value === null && !["==", "!="].includes(comp)) {
      throw new Error(
        `FakeFirebaseError: Invalid query. Null only supports '==' and '!=' comparisons.`
      );
    }
    this.filters.push({ key, comp, value });
    return result || this;
  }

  offset(): Query {
    return mockOffset(...arguments) || this;
  }

  limit(): Query {
    return mockLimit(...arguments) || this;
  }

  orderBy(): Query {
    return mockOrderBy(...arguments) || this;
  }

  startAfter(): Query {
    return mockStartAfter(...arguments) || this;
  }

  startAt(): Query {
    return mockStartAt(...arguments) || this;
  }

  withConverter(): Query {
    return mockWithConverter(...arguments) || this;
  }

  onSnapshot(): () => void {
    mockQueryOnSnapshot(...arguments);
    const [callback, errorCallback] = arguments;
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
}
