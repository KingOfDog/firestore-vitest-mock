import { vi } from "vitest";
import {
  type DatabaseCollections,
  type FakeFirestoreDatabase,
} from "./firestore.model";

export const mockTimestampToDate = vi.fn<unknown[], Date>();
export const mockTimestampToMillis = vi.fn<unknown[], number>();
export const mockTimestampFromDate = vi.fn<unknown[], Timestamp>();
export const mockTimestampFromMillis = vi.fn<unknown[], Timestamp>();
export const mockTimestampNow = vi.fn<unknown[], Timestamp>();

export class Timestamp {
  [key: string]: unknown;

  constructor(public seconds: number, public nanoseconds: number) {}

  isEqual(other: Timestamp): boolean {
    return (
      other instanceof Timestamp &&
      other.seconds === this.seconds &&
      other.nanoseconds === this.nanoseconds
    );
  }

  toDate(): Date {
    return mockTimestampToDate(...arguments) || new Date(this._toMillis());
  }

  toMillis(): number {
    return mockTimestampToMillis(...arguments) || this._toMillis();
  }

  valueOf(): string {
    return JSON.stringify(this.toMillis());
  }

  static fromDate(date: Date): Timestamp {
    return (
      mockTimestampFromDate(...arguments) ||
      Timestamp._fromMillis(date.getTime())
    );
  }

  static fromMillis(millis: number): Timestamp {
    return (
      mockTimestampFromMillis(...arguments) || Timestamp._fromMillis(millis)
    );
  }

  static _fromMillis(millis: number): Timestamp {
    const seconds = Math.floor(millis / 1000);
    const nanoseconds = 1000000 * (millis - seconds * 1000);
    return new Timestamp(seconds, nanoseconds);
  }

  // Dates only return whole-number millis
  _toMillis(): number {
    return this.seconds * 1000 + Math.round(this.nanoseconds / 1000000);
  }

  static now(): Timestamp {
    const now = new Date();
    return mockTimestampNow(...arguments) || Timestamp.fromDate(now);
  }
}

//
// Search data for possible timestamps and convert to class.
export function convertTimestamps(
  data: DatabaseCollections | Timestamp,
  path: DatabaseCollections[] = []
): FakeFirestoreDatabase | Timestamp {
  if (!data) {
    return data;
  }
  // we need to avoid self-referencing DB's (can happen on db.get)
  // Check we have not looped.  If we have, backout
  if (!isTimestamp(data) && path.includes(data)) {
    return data;
  }

  // Check if this object is or contains a timestamp
  if (typeof data === "object") {
    const keys = Object.keys(data);
    // if it is a timestamp, convert to the appropriate class
    if (isTimestamp(data)) {
      return new Timestamp(data.seconds, data.nanoseconds);
    } else {
      // Search recursively for any timestamps in this data
      // Keep track of the path taken, so we can avoid self-referencing loops
      // Note: running full-setup.test.js will fail without this check
      // add console.log(`${path} => ${k}`); to see how this class is added as a property
      path.push(data);
      keys.forEach((k) => {
        // @ts-expect-error Type safety
        data[k] = convertTimestamps(data[k], path);
      });
      path.pop();
    }
  }
  return data;
}

function isTimestamp(data: Record<string, unknown>): data is Timestamp {
  const keys = Object.keys(data);
  return (
    keys.length === 2 &&
    !!keys.find((k) => k === "seconds") &&
    !!keys.find((k) => k === "nanoseconds")
  );
}

export const mocks = {
  mockTimestampToDate,
  mockTimestampToMillis,
  mockTimestampFromDate,
  mockTimestampFromMillis,
  mockTimestampNow,
};
