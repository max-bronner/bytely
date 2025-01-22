import { describe, it, expect, beforeEach } from 'vitest';
import { createStruct } from '../../src/struct/createStruct';

describe('Pointer', () => {
  let buffer: ArrayBuffer;
  let view: DataView;
  let struct: ReturnType<typeof createStruct>; // Struct<ParsedData>

  beforeEach(() => {
    buffer = new ArrayBuffer(8);
    view = new DataView(buffer);
    struct = createStruct();
  });

  it('should return pointer', () => {
    view.setUint32(0, 1234, true);
    struct.addMember('pointer').pointer();

    const result = struct.parse(view, 0);
    expect(result.pointer).toBe(1234);
  });

  it('should return 0 for allowed null pointer', () => {
    view.setUint32(0, 0, true);
    struct.addMember('pointer').pointer({ allowNullPointer: true });

    const result = struct.parse(view, 0);
    expect(result.pointer).equal(0);
  });

  it('should return null for not allowed null pointer', () => {
    view.setUint32(0, 0, true);
    struct.addMember('pointer').pointer({ allowNullPointer: false });

    const result = struct.parse(view, 0);
    expect(result.pointer).toBeNull();
  });

  it('should return pointer at offset', () => {
    view.setUint32(4, 1234, true);
    struct.addMember('pointer').pointer();

    const result = struct.parse(view, 4);
    expect(result.pointer).toBe(1234);
  });

  it('should return multiple defined pointers', () => {
    view.setUint32(0, 1234, true);
    view.setUint32(4, 5678, true);

    struct.addMember('pointer1').pointer();
    struct.addMember('pointer2').pointer();

    const result = struct.parse(view, 0);
    expect(result.pointer1).toBe(1234);
    expect(result.pointer2).toBe(5678);
  });
});
