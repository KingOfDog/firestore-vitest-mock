import { MockedDocument } from './buildDocFromHash.model';

export type Comparator = '<' | '<=' | '==' | '!=' | '>=' | '>' | 'array-contains' | 'in' | 'not-in' | 'array-contains-any';

export interface QueryFilter {
  key: string;
  comp: Comparator;
  value: string;
}

export interface MockedQuerySnapshot<Doc = MockedDocument> {
  empty: boolean;
  size: number;
  docs: Array<Doc>;
  forEach(callbackfn: (value: Doc, index: number, array: Array<Doc>) => void): void;
  docChanges(): Array<never>;
}
