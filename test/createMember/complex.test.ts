import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createStruct } from '../../src/struct/createStruct';

describe('Complex Types', () => {
  const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => undefined);

  let buffer: ArrayBuffer;
  let view: DataView;
  let struct: ReturnType<typeof createStruct>; // Struct<ParsedData>
  const textEncoder = new TextEncoder();

  beforeEach(() => {
    buffer = new ArrayBuffer(100);
    view = new DataView(buffer);
    struct = createStruct();
  });

  afterEach(() => {
    consoleSpy.mockReset();
  });

  describe('Strings', () => {
    it('should return string', () => {
      const str = 'Test String';
      textEncoder.encodeInto(str, new Uint8Array(buffer));
      struct.addMember('text').string();

      const result = struct.parse(view, 0);
      expect(result.text).toBe(str);
    });

    it('should log debugging info in console', () => {
      const str = 'Test String';
      textEncoder.encodeInto(str, new Uint8Array(buffer));
      struct.addMember('text').string({ debug: true });

      struct.parse(view, 0);
      expect(consoleSpy).toHaveBeenCalledWith('text', 0, str);
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

    it('should log debugging info in console', () => {
      new Uint8Array(buffer).set([40, 41, 42, 43]);
      struct.addMember('values').array(4, { debug: true }).uint8();

      struct.parse(view, 0);
      expect(consoleSpy).toHaveBeenCalledWith('values', 0, [40, 41, 42, 43]);
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

    it('should return data from a struct type', () => {
      view.setUint32(0, 42, true);
      view.setUint8(4, 1);
      view.setFloat32(5, 3.14, true);

      const subStruct = createStruct();
      subStruct.addMember('structType').uint8();
      subStruct.addMember('float').float32();

      const structMap = {
        1: subStruct,
      };

      struct.addMember('int').uint32();
      struct.addMember('subStruct').structByType(structMap);

      const result = struct.parse(view, 0);
      expect(result.int).toBe(42);
      expect(result.subStruct.float).toBeCloseTo(3.14);
    });

    it('should log debugging info in console', () => {
      view.setUint32(0, 42, true);
      view.setInt16(4, 1234, true);

      const subStruct = createStruct();
      subStruct.addMember('int16').int16();

      struct.addMember('int32').uint32();
      struct.addMember('subStruct').struct(subStruct, { debug: true });

      struct.parse(view, 0);
      expect(consoleSpy).toHaveBeenCalledWith('subStruct', 4, { int16: 1234 });
    });
  });

  describe('Custom Parser', () => {
    it('should return custom data type', () => {
      const customParser = (view: DataView, offset: number) => {
        const byteSize = 4;
        const result = view.getBigInt64(offset, true);
        return { byteSize, result };
      };

      view.setBigInt64(0, 123456789n, true);
      struct.addMember('bigInt').custom(customParser);

      const result = struct.parse(view, 0);
      expect(result.bigInt).toBe(123456789n);
    });
  });
});
