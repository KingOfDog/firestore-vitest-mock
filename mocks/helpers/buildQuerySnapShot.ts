import { Timestamp } from '../timestamp';
import buildDocFromHash from './buildDocFromHash';
import { DocumentHash } from './buildDocFromHash.model';
import { MockedQuerySnapshot, QueryFilter } from './buildQuerySnapShot.model';

/**
 * Builds a query result from the given array of record objects.
 *
 * @param requestedRecords
 * @param filters
 */
export default function buildQuerySnapShot(requestedRecords: Array<DocumentHash>, filters?: Array<QueryFilter>, selectFields?: string[]): MockedQuerySnapshot {
  const definiteRecords = requestedRecords.filter(rec => !!rec);
  const results = _filteredDocuments(definiteRecords, filters);
  const docs = results.map(doc => buildDocFromHash(doc, 'abc123', selectFields));

  return {
    empty: results.length < 1,
    size: results.length,
    docs,
    forEach(callback) {
      docs.forEach(callback);
    },
    docChanges() {
      return [];
    },
  };
}

/**
 * @typedef DocumentHash
 * @type {import('./buildDocFromHash').DocumentHash}
 */

/**
 * @typedef Comparator
 * @type {import('./buildQuerySnapShot').Comparator}
 */

/**
 * Applies query filters to an array of mock document data.
 *
 * @param {Array<DocumentHash>} records The array of records to filter.
 * @param {Array<{ key: string; comp: Comparator; value: unknown }>=} filters The filters to apply.
 * If no filters are provided, then the records array is returned as-is.
 *
 * @returns {Array<import('./buildDocFromHash').DocumentHash>} The filtered documents.
 */
function _filteredDocuments(records: DocumentHash[], filters?: QueryFilter[]): DocumentHash[] {
  if (!filters || !Array.isArray(filters) || filters.length === 0) {
    return records;
  }

  filters.forEach(({ key, comp, value }) => {
    // https://firebase.google.com/docs/reference/js/firebase.firestore#wherefilterop
    // Convert values to string to make Array comparisons work
    // See https://jsbin.com/bibawaf/edit?js,console

    switch (comp) {
      // https://firebase.google.com/docs/firestore/query-data/queries#query_operators
      case '<':
        records = _recordsLessThanValue(records, key, value);
        break;

      case '<=':
        records = _recordsLessThanOrEqualToValue(records, key, value);
        break;

      case '==':
        records = _recordsEqualToValue(records, key, value);
        break;

      case '!=':
        records = _recordsNotEqualToValue(records, key, value);
        break;

      case '>=':
        records = _recordsGreaterThanOrEqualToValue(records, key, value);
        break;

      case '>':
        records = _recordsGreaterThanValue(records, key, value);
        break;

      case 'array-contains':
        records = _recordsArrayContainsValue(records, key, value);
        break;

      case 'in':
        records = _recordsWithValueInList(records, key, value);
        break;

      case 'not-in':
        records = _recordsWithValueNotInList(records, key, value);
        break;

      case 'array-contains-any':
        records = _recordsWithOneOfValues(records, key, value);
        break;
    }
  });

  return records;
}

function _recordsWithKey(records: DocumentHash[], key: string): DocumentHash[] {
  return records.filter(record => record && record[key] !== undefined);
}

function _recordsWithNonNullKey(records: DocumentHash[], key: string): DocumentHash[] {
  return records.filter(record => record && record[key] !== undefined && record[key] !== null);
}

function _shouldCompareTimestamp(a: unknown, b: unknown): a is Timestamp {
  //We check whether toMillis method exists to support both Timestamp mock and Firestore Timestamp object
  //B is expected to be Date, not Timestamp, just like Firestore does
  return (
    typeof a === 'object' && a !== null && typeof (a as Record<string, unknown>).toMillis === 'function' && b instanceof Date
  );
}

function _recordsLessThanValue(records: DocumentHash[], key: string, value: unknown): DocumentHash[] {
  return _recordsWithNonNullKey(records, key).filter(record => {
    const recordValue = record[key];
    if (typeof recordValue === 'number' && typeof value === 'number') {
      return recordValue < value;
    }
    if (_shouldCompareTimestamp(recordValue, value)) {
      return recordValue.toMillis() < (value as Date).getTime();
    }
    return String(record[key]) < String(value);
  });
}

function _recordsLessThanOrEqualToValue(records: DocumentHash[], key: string, value: unknown): DocumentHash[] {
  return _recordsWithNonNullKey(records, key).filter(record => {
    const recordValue = record[key];
    if (typeof recordValue === 'number' && typeof value === 'number') {
      return recordValue <= value;
    }
    if (_shouldCompareTimestamp(recordValue, value)) {
      return recordValue.toMillis() <= (value as Date).getTime();
    }
    return String(record[key]) <= String(value);
  });
}

function _recordsEqualToValue(records: DocumentHash[], key: string, value: unknown): DocumentHash[] {
  return _recordsWithKey(records, key).filter(record => {
    const recordValue = record[key];
    if (_shouldCompareTimestamp(recordValue, value)) {
      //NOTE: for equality, we must compare numbers!
      return recordValue.toMillis() === (value as Date).getTime();
    }
    return String(record[key]) === String(value);
  });
}

function _recordsNotEqualToValue(records: DocumentHash[], key: string, value: unknown): DocumentHash[] {
  return _recordsWithKey(records, key).filter(record => {
    const recordValue = record[key];
    if (_shouldCompareTimestamp(recordValue, value)) {
      //NOTE: for equality, we must compare numbers!
      return recordValue.toMillis() !== (value as Date).getTime();
    }
    return String(record[key]) !== String(value);
  });
}

function _recordsGreaterThanOrEqualToValue(records: DocumentHash[], key: string, value: unknown): DocumentHash[] {
  return _recordsWithNonNullKey(records, key).filter(record => {
    const recordValue = record[key];
    if (typeof recordValue === 'number' && typeof value === 'number') {
      return recordValue >= value;
    }
    if (_shouldCompareTimestamp(recordValue, value)) {
      return recordValue.toMillis() >= (value as Date).getTime();
    }
    return String(record[key]) >= String(value);
  });
}

function _recordsGreaterThanValue(records: DocumentHash[], key: string, value: unknown): DocumentHash[] {
  return _recordsWithNonNullKey(records, key).filter(record => {
    const recordValue = record[key];
    if (typeof recordValue === 'number' && typeof value === 'number') {
      return recordValue > value;
    }
    if (_shouldCompareTimestamp(recordValue, value)) {
      return recordValue.toMillis() > (value as Date).getTime();
    }
    return String(record[key]) > String(value);
  });
}

/**
 * @see https://firebase.google.com/docs/firestore/query-data/queries#array_membership
 */
function _recordsArrayContainsValue(records: DocumentHash[], key: string, value: unknown): DocumentHash[] {
  return records.filter(
    record => record && record[key] && Array.isArray(record[key]) && (record[key] as Array<unknown>).includes(value),
  );
}

/**
 * @see https://firebase.google.com/docs/firestore/query-data/queries#in_not-in_and_array-contains-any
 */
function _recordsWithValueInList(records: DocumentHash[], key: string, value: unknown): DocumentHash[] {
  // TODO: Throw an error when a value is passed that contains more than 10 values
  return records.filter(record => {
    if (!record || record[key] === undefined) {
      return false;
    }
    return value && Array.isArray(value) && value.includes(record[key]);
  });
}

/**
 * @see https://firebase.google.com/docs/firestore/query-data/queries#not-in
 */
function _recordsWithValueNotInList(records: DocumentHash[], key: string, value: unknown): DocumentHash[] {
  // TODO: Throw an error when a value is passed that contains more than 10 values
  return _recordsWithKey(records, key).filter(
    record => value && Array.isArray(value) && !value.includes(record[key]),
  );
}

/**
 * @see https://firebase.google.com/docs/firestore/query-data/queries#in_not-in_and_array-contains-any
 */
function _recordsWithOneOfValues(records: DocumentHash[], key: string, value: unknown): DocumentHash[] {
  // TODO: Throw an error when a value is passed that contains more than 10 values
  return records.filter(
    record =>
      record &&
      record[key] &&
      Array.isArray(record[key]) &&
      value &&
      Array.isArray(value) &&
      (record[key] as Array<unknown>).some(v => value.includes(v)),
  );
}
