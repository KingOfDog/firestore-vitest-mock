import { type MockedDocument } from "./buildDocFromHash.model";

export type Comparator =
  | "<"
  | "<="
  | "=="
  | "!="
  | ">="
  | ">"
  | "array-contains"
  | "in"
  | "not-in"
  | "array-contains-any";

export interface QueryFilter {
  key: string;
  comp: Comparator;
  value: string;
}

export interface MockedQuerySnapshot<Doc = MockedDocument> {
  empty: boolean;
  size: number;
  docs: Doc[];
  forEach: (
    callbackfn: (value: Doc, index: number, array: Doc[]) => void
  ) => void;
  docChanges: () => never[];
}
