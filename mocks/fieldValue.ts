import { vi } from "vitest";

export const mockArrayUnionFieldValue = vi.fn();
export const mockArrayRemoveFieldValue = vi.fn();
export const mockDeleteFieldValue = vi.fn();
export const mockIncrementFieldValue = vi.fn();
export const mockServerTimestampFieldValue = vi.fn();

export class FieldValue {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }

  isEqual(other) {
    return (
      other instanceof FieldValue &&
      other.type === this.type &&
      other.value === this.value
    );
  }

  static arrayUnion(elements = []) {
    mockArrayUnionFieldValue(...arguments);
    if (!Array.isArray(elements)) {
      elements = [elements];
    }
    return new FieldValue("arrayUnion", elements);
  }

  static arrayRemove(elements) {
    mockArrayRemoveFieldValue(...arguments);
    if (!Array.isArray(elements)) {
      elements = [elements];
    }
    return new FieldValue("arrayRemove", elements);
  }

  static increment(amount = 1) {
    mockIncrementFieldValue(...arguments);
    return new FieldValue("increment", amount);
  }

  static serverTimestamp() {
    mockServerTimestampFieldValue(...arguments);
    return new FieldValue("serverTimestamp");
  }

  static delete() {
    mockDeleteFieldValue(...arguments);
    return new FieldValue("delete");
  }
}