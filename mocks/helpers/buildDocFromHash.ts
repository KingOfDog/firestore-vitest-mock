/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DocumentHash, MockedDocument } from "./buildDocFromHash.model";

import { Timestamp } from "../timestamp";

export default function buildDocFromHash(
  hash?: DocumentHash,
  id?: string,
  selectFields?: string[]
): MockedDocument {
  const exists = !!hash || false;
  return {
    createTime: (hash && hash._createTime) || Timestamp.now(),
    exists,
    id: (hash && hash.id) ?? id,
    readTime: hash && hash._readTime,
    ref: hash && hash._ref,
    metadata: {
      hasPendingWrites: "Server"
    },
    updateTime: hash && hash._updateTime,
    data() {
      if (!exists) {
        // From Firestore docs: "Returns 'undefined' if the document doesn't exist."
        // See https://firebase.google.com/docs/reference/js/firebase.firestore.DocumentSnapshot#data
        return undefined;
      }
      let copy = { ...hash };
      if (!hash?._ref.parent.firestore.options.includeIdsInData) {
        delete copy.id;
      }
      // @ts-expect-error Should not be included in data
      delete copy._collections;
      delete copy._createTime;
      delete copy._readTime;
      // @ts-expect-error Should not be included in data
      delete copy._ref;
      delete copy._updateTime;

      if (selectFields !== undefined) {
        copy = Object.keys(copy)
          .filter(key => key === "id" || selectFields.includes(key))
          .reduce((res: Record<string, unknown>, key) => ((res[key] = copy[key]), res), {});
      }

      return copy;
    },
    get(fieldPath) {
      // The field path can be compound: from the firestore docs
      //  fieldPath The path (e.g. 'foo' or 'foo.bar') to a specific field.
      const parts = fieldPath.split(".");
      const data = this.data();
      if (!data) { return null; }
      return parts.reduce((acc: Record<string, unknown> | null, part, index) => {
        if (!acc) { return null; }
        const value = acc[part];
        // if no key is found
        if (value === undefined) {
          // return null if we are on the last item in parts
          // otherwise, return an empty object, so we can continue to iterate
          return parts.length - 1 === index ? null : {};
        }

        // if there is a value, return it
        return value as Record<string, unknown> | null;
      }, data);
    }
  } as MockedDocument;
}
