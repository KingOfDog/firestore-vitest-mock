import { vi } from "vitest";

export const mockArrayUnionFieldValue = vi.fn();
export const mockArrayRemoveFieldValue = vi.fn();
export const mockDeleteFieldValue = vi.fn();
export const mockIncrementFieldValue = vi.fn();
export const mockServerTimestampFieldValue = vi.fn();

type FieldValueType = 'arrayUnion' | 'arrayRemove' | 'increment' | 'serverTimestamp' | 'delete';

export class FieldValue {
  constructor(private type: FieldValueType, private value?: unknown) {
  }

  isEqual(other: FieldValue): boolean {
    return (
      other instanceof FieldValue &&
      other.type === this.type &&
      other.value === this.value
    );
  }

  static arrayUnion(elements: Array<unknown> = []): FieldValue {
    mockArrayUnionFieldValue(...arguments);
    if (!Array.isArray(elements)) {
      elements = [elements];
    }
    return new FieldValue("arrayUnion", elements);
  }

  static arrayRemove(elements: Array<unknown>): FieldValue {
    mockArrayRemoveFieldValue(...arguments);
    if (!Array.isArray(elements)) {
      elements = [elements];
    }
    return new FieldValue("arrayRemove", elements);
  }

  static increment(amount = 1): FieldValue {
    mockIncrementFieldValue(...arguments);
    return new FieldValue("increment", amount);
  }

  static serverTimestamp(): FieldValue {
    mockServerTimestampFieldValue(...arguments);
    return new FieldValue("serverTimestamp");
  }

  static delete(): FieldValue {
    mockDeleteFieldValue(...arguments);
    return new FieldValue("delete");
  }
}