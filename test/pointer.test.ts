import { describe, it, expect } from 'vitest';
import { createStruct } from '../src/struct/createStruct';

describe('Pointer', () => {
  it('should parse valid pointers', () => {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setUint32(0, 1234, true);

    const struct = createStruct();
    struct.addMember('pointer').pointer();

    const result = struct.parse(view, 0);
    expect(result.pointer).toBe(1234);
  });

  it('should return 0 for allowed null pointer', () => {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setUint32(0, 0, true);

    const struct = createStruct();
    struct.addMember('pointer').pointer({ allowNullPointer: true });

    const result = struct.parse(view, 0);
    expect(result.pointer).equal(0);
  });

  it('should throw on null pointer when not allowed', () => {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setUint32(0, 0, true);

    const struct = createStruct();
    struct.addMember('pointer').pointer({ allowNullPointer: false });

    const result = struct.parse(view, 0);
    expect(result.pointer).toBeNull();
  });
});
