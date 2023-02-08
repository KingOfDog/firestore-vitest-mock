abstract class Path<T> {
  constructor(public segments: string[]) {
  }

  compareTo(other: Path<T>): number {
    const len = Math.min(this.segments.length, other.segments.length);
    for (let i = 0; i < len; i++) {
      if (this.segments[i] < other.segments[i]) {
        return -1;
      }
      if (this.segments[i] > other.segments[i]) {
        return 1;
      }
    }
    if (this.segments.length < other.segments.length) {
      return -1;
    }
    if (this.segments.length > other.segments.length) {
      return 1;
    }
    return 0;
  }

  isEqual(other: Path<T>): boolean {
    return this === other || this.compareTo(other) === 0;
  }
}

export class FieldPath extends Path<FieldPath> {
  private static _DOCUMENT_ID = new FieldPath("__name__");

  constructor(...segments: string[]) {
    super(segments);
  }
  static documentId(): FieldPath {
    return FieldPath._DOCUMENT_ID;
  }
  isEqual(other: FieldPath): boolean {
    return super.isEqual(other);
  }
}
