import { describe, it, expect, beforeEach } from 'vitest';
import { createStruct } from '../../src/struct/createStruct';

describe('Primitive Types', () => {
  let buffer: ArrayBuffer;
  let view: DataView;
  let struct: ReturnType<typeof createStruct>; // Struct<ParsedData>

  beforeEach(() => {
    buffer = new ArrayBuffer(20);
    view = new DataView(buffer);
    struct = createStruct();
  });

  describe('uint8', () => {
    it('should return uint8 value', () => {
      view.setUint8(0, 42);
      struct.addMember('value').uint8();

      const result = struct.parse(view, 0);
      expect(result.value).toBe(42);
    });
  });

  describe('uint16', () => {
    it('should return uint16 value', () => {
      view.setUint16(0, 1234, true);
      struct.addMember('value').int32();

      const result = struct.parse(view, 0);
      expect(result.value).toBe(1234);
    });
  });
});
