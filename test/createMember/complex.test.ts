import { describe, it, expect, beforeEach } from 'vitest';
import { createStruct } from '../../src/struct/createStruct';

describe('Complex Types', () => {
  let buffer: ArrayBuffer;
  let view: DataView;
  let struct: ReturnType<typeof createStruct>; // Struct<ParsedData>
  const textEncoder = new TextEncoder();

  beforeEach(() => {
    buffer = new ArrayBuffer(100);
    view = new DataView(buffer);
    struct = createStruct();
  });

  describe('Strings', () => {
    it('should return string', () => {
      const str = 'Test String';
      textEncoder.encodeInto(str, new Uint8Array(buffer));
      struct.addMember('text').string();

      const result = struct.parse(view, 0);
      expect(result.text).toBe(str);
    });
  });

  describe('Arrays', () => {
    it('should return array data with fixed length', () => {
      new Uint8Array(buffer).set([40, 41, 42, 43]);
      struct.addMember('values').array(4).uint8();

      const result = struct.parse(view, 0);
      expect(result.values).toEqual([40, 41, 42, 43]);
    });

    it('should return array data with dynamic length', () => {
      view.setUint8(0, 4); // count
      new Uint8Array(buffer).set([40, 41, 42, 43], 1);

      struct.addMember('count').uint8();
      struct.addMember('values').array('count').uint8();

      const result = struct.parse(view, 0);
      expect(result.values).toEqual([40, 41, 42, 43]);
    });
  });

  describe('Structs', () => {
    it('should return data from a struct type', () => {
      view.setUint32(0, 42, true);
      view.setFloat32(4, 3.14, true);

      const subStruct = createStruct();
      subStruct.addMember('float').float32();

      struct.addMember('int').uint32();
      struct.addMember('subStruct').struct(subStruct);

      const result = struct.parse(view, 0);
      expect(result.int).toBe(42);
      expect(result.subStruct.float).toBeCloseTo(3.14);
    });
  });
});
