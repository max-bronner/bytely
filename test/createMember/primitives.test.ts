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
    beforeEach(() => {
      struct.addMember('value').uint8({ debug: true });
    });

    it('should return uint8 value', () => {
      view.setUint8(0, 42);

      const result = struct.parse(view, 0);
      expect(result.value).toBe(42);
    });

    it('should not return negative values', () => {
      view.setUint8(0, -42);

      const result = struct.parse(view, 0);
      expect(result.value).not.toBe(42);
    });

    it('should return null for invalid offset', () => {
      view.setUint32(0, 0, true);

      struct = createStruct();
      struct.addMember('value').pointer({ allowNullPointer: false }).uint8();

      const result = struct.parse(view, 0);
      expect(result.value).toBeNull();
    });
  });

  describe('uint16', () => {
    beforeEach(() => {
      struct.addMember('value').uint16({ debug: true });
    });

    it('should return uint16 value', () => {
      view.setUint16(0, 1234, true);

      const result = struct.parse(view, 0);
      expect(result.value).toBe(1234);
    });

    it('should not return negative values', () => {
      view.setUint16(0, -1234, true);

      const result = struct.parse(view, 0);
      expect(result.value).not.toBe(1234);
    });

    it('should return null for invalid offset', () => {
      view.setUint32(0, 0, true);

      struct = createStruct();
      struct.addMember('value').pointer({ allowNullPointer: false }).uint16();

      const result = struct.parse(view, 0);
      expect(result.value).toBeNull();
    });
  });

  describe('uint32', () => {
    beforeEach(() => {
      struct.addMember('value').uint32({ debug: true });
    });

    it('should return uint32 value', () => {
      view.setUint32(0, 123456, true);

      const result = struct.parse(view, 0);
      expect(result.value).toBe(123456);
    });

    it('should not return negative values', () => {
      view.setUint32(0, -123456, true);

      const result = struct.parse(view, 0);
      expect(result.value).not.toBe(123456);
    });

    it('should return null for invalid offset', () => {
      view.setUint32(0, 0, true);

      struct = createStruct();
      struct.addMember('value').pointer({ allowNullPointer: false }).uint32();

      const result = struct.parse(view, 0);
      expect(result.value).toBeNull();
    });
  });

  describe('int32', () => {
    it('should return int32 value', () => {
      view.setInt32(0, -12345, true);
      struct.addMember('value').int32({ debug: true });

      const result = struct.parse(view, 0);
      expect(result.value).toBe(-12345);
    });

    it('should return null for invalid offset', () => {
      view.setUint32(0, 0, true);
      struct.addMember('value').pointer({ allowNullPointer: false }).int32();

      const result = struct.parse(view, 0);
      expect(result.value).toBeNull();
    });
  });

  describe('float32', () => {
    it('should return float32 value', () => {
      view.setFloat32(0, 3.14, true);
      struct.addMember('value').float32({ debug: true });

      const result = struct.parse(view, 0);
      expect(result.value).toBeCloseTo(3.14);
    });

    it('should return null for invalid offset', () => {
      view.setUint32(0, 0, true);
      struct.addMember('value').pointer({ allowNullPointer: false }).float32();

      const result = struct.parse(view, 0);
      expect(result.value).toBeNull();
    });
  });
});
