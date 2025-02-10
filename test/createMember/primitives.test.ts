import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createStruct } from '../../src/struct/createStruct';

describe('Primitive Types', () => {
  const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => undefined);

  let buffer: ArrayBuffer;
  let view: DataView;
  let struct: ReturnType<typeof createStruct>; // Struct<ParsedData>
  const textEncoder = new TextEncoder();

  beforeEach(() => {
    buffer = new ArrayBuffer(20);
    view = new DataView(buffer);
    struct = createStruct();
  });

  afterEach(() => {
    consoleSpy.mockReset(); // Fully restores the original console.log
  });

  describe('int8', () => {
    beforeEach(() => {
      struct.addMember('value').int8();
    });

    it('should return int8 value', () => {
      view.setInt8(0, -42);

      const result = struct.parse(view, 0);
      expect(result.value).toBe(-42);
    });

    it('should return null for invalid offset', () => {
      view.setUint32(0, 0, true);

      struct = createStruct();
      struct.addMember('value').pointer({ allowNullPointer: false }).int8();

      const result = struct.parse(view, 0);
      expect(result.value).toBeNull();
    });

    it('should log debugging info in console', () => {
      view.setInt8(2, -42);

      struct = createStruct();
      struct.addMember('value').int8({ debug: true });

      struct.parse(view, 2);
      expect(consoleSpy).toHaveBeenCalledWith('value', 2, -42);
    });
  });

  describe('uint8', () => {
    beforeEach(() => {
      struct.addMember('value').uint8();
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

    it('should log debugging info in console', () => {
      view.setUint8(2, 42);

      struct = createStruct();
      struct.addMember('value').uint8({ debug: true });

      struct.parse(view, 2);
      expect(consoleSpy).toHaveBeenCalledWith('value', 2, 42);
    });
  });

  describe('int16', () => {
    beforeEach(() => {
      struct.addMember('value').int16();
    });

    it('should return int16 value', () => {
      view.setInt16(0, -1234, true);

      const result = struct.parse(view, 0);
      expect(result.value).toBe(-1234);
    });

    it('should return int16 value using big endian', () => {
      view.setInt16(0, -1234, false);

      struct = createStruct();
      struct.addMember('value').int16({ littleEndian: false });

      const result = struct.parse(view, 0);
      expect(result.value).toBe(-1234);
    });

    it('should return null for invalid offset', () => {
      view.setUint32(0, 0, true);

      struct = createStruct();
      struct.addMember('value').pointer({ allowNullPointer: false }).int16();

      const result = struct.parse(view, 0);
      expect(result.value).toBeNull();
    });

    it('should log debugging info in console', () => {
      view.setInt16(4, -1234, true);

      struct = createStruct();
      struct.addMember('value').int16({ debug: true });

      struct.parse(view, 4);
      expect(consoleSpy).toHaveBeenCalledWith('value', 4, -1234);
    });
  });

  describe('uint16', () => {
    beforeEach(() => {
      struct.addMember('value').uint16();
    });

    it('should return uint16 value', () => {
      view.setUint16(0, 1234, true);

      const result = struct.parse(view, 0);
      expect(result.value).toBe(1234);
    });

    it('should return uint16 value using big endian', () => {
      view.setUint16(0, 1234, false);

      struct = createStruct();
      struct.addMember('value').uint16({ littleEndian: false });

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

    it('should log debugging info in console', () => {
      view.setUint16(4, 1234, true);

      struct = createStruct();
      struct.addMember('value').uint16({ debug: true });

      struct.parse(view, 4);
      expect(consoleSpy).toHaveBeenCalledWith('value', 4, 1234);
    });
  });

  describe('int32', () => {
    it('should return int32 value', () => {
      view.setInt32(0, -12345, true);
      struct.addMember('value').int32();

      const result = struct.parse(view, 0);
      expect(result.value).toBe(-12345);
    });

    it('should return int32 value using big endian', () => {
      view.setInt32(0, -12345, false);
      struct.addMember('value').int32({ littleEndian: false });

      const result = struct.parse(view, 0);
      expect(result.value).toBe(-12345);
    });

    it('should return null for invalid offset', () => {
      view.setUint32(0, 0, true);
      struct.addMember('value').pointer({ allowNullPointer: false }).int32();

      const result = struct.parse(view, 0);
      expect(result.value).toBeNull();
    });

    it('should log debugging info in console', () => {
      view.setInt32(4, -12345, true);

      struct = createStruct();
      struct.addMember('value').int32({ debug: true });

      struct.parse(view, 4);
      expect(consoleSpy).toHaveBeenCalledWith('value', 4, -12345);
    });
  });

  describe('uint32', () => {
    beforeEach(() => {
      struct.addMember('value').uint32();
    });

    it('should return uint32 value', () => {
      view.setUint32(0, 123456, true);

      const result = struct.parse(view, 0);
      expect(result.value).toBe(123456);
    });

    it('should return uint32 value using big endian', () => {
      view.setUint32(0, 123456, false);

      struct = createStruct();
      struct.addMember('value').uint32({ littleEndian: false });

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

    it('should log debugging info in console', () => {
      view.setUint32(4, 123456, true);

      struct = createStruct();
      struct.addMember('value').uint32({ debug: true });

      struct.parse(view, 4);
      expect(consoleSpy).toHaveBeenCalledWith('value', 4, 123456);
    });
  });

  describe('int64', () => {
    it('should return int64 value', () => {
      view.setBigInt64(0, -12345n, true);
      struct.addMember('value').int64();

      const result = struct.parse(view, 0);
      expect(result.value).toBe(-12345n);
    });

    it('should return int64 value using big endian', () => {
      view.setBigInt64(0, -12345n, false);
      struct.addMember('value').int64({ littleEndian: false });

      const result = struct.parse(view, 0);
      expect(result.value).toBe(-12345n);
    });

    it('should return null for invalid offset', () => {
      view.setUint32(0, 0, true);
      struct.addMember('value').pointer({ allowNullPointer: false }).int64();

      const result = struct.parse(view, 0);
      expect(result.value).toBeNull();
    });

    it('should log debugging info in console', () => {
      view.setBigInt64(4, -12345n, true);

      struct = createStruct();
      struct.addMember('value').int64({ debug: true });

      struct.parse(view, 4);
      expect(consoleSpy).toHaveBeenCalledWith('value', 4, -12345n);
    });
  });

  describe('uint64', () => {
    beforeEach(() => {
      struct.addMember('value').uint64();
    });

    it('should return uint64 value', () => {
      view.setBigUint64(0, 123456n, false);

      struct = createStruct();
      struct.addMember('value').uint64({ littleEndian: false });

      const result = struct.parse(view, 0);
      expect(result.value).toBe(123456n);
    });

    it('should return uint64 value using big endian', () => {
      view.setBigUint64(0, 123456n, true);

      const result = struct.parse(view, 0);
      expect(result.value).toBe(123456n);
    });

    it('should not return negative values', () => {
      view.setBigUint64(0, -123456n, true);

      const result = struct.parse(view, 0);
      expect(result.value).not.toBe(123456n);
    });

    it('should return null for invalid offset', () => {
      view.setUint32(0, 0, true);

      struct = createStruct();
      struct.addMember('value').pointer({ allowNullPointer: false }).uint64();

      const result = struct.parse(view, 0);
      expect(result.value).toBeNull();
    });

    it('should log debugging info in console', () => {
      view.setBigUint64(4, 123456n, true);

      struct = createStruct();
      struct.addMember('value').uint64({ debug: true });

      struct.parse(view, 4);
      expect(consoleSpy).toHaveBeenCalledWith('value', 4, 123456n);
    });
  });

  describe('float32', () => {
    const value = 2.718;
    it('should return float32 value', () => {
      view.setFloat32(0, value, true);
      struct.addMember('value').float32();

      const result = struct.parse(view, 0);
      expect(result.value).toBeCloseTo(value);
    });

    it('should return float32 value using big endian', () => {
      view.setFloat32(0, value, false);
      struct.addMember('value').float32({ littleEndian: false });

      const result = struct.parse(view, 0);
      expect(result.value).toBeCloseTo(value);
    });

    it('should return null for invalid offset', () => {
      view.setUint32(0, 0, true);
      struct.addMember('value').pointer({ allowNullPointer: false }).float32();

      const result = struct.parse(view, 0);
      expect(result.value).toBeNull();
    });

    it('should log debugging info in console', () => {
      const offset = 4;
      view.setFloat32(offset, value, true);

      struct = createStruct();
      struct.addMember('value').float32({ debug: true });

      struct.parse(view, offset);
      expect(consoleSpy).toHaveBeenCalledOnce();

      const debugInfo = consoleSpy.mock.calls[0];
      expect(debugInfo[0]).toBe('value');
      expect(debugInfo[1]).toBe(offset);
      expect(debugInfo[2]).toBeCloseTo(value);
    });
  });

  describe('float64', () => {
    const value = 3.1415926535897932;
    it('should return float64 value', () => {
      view.setFloat64(0, value, true);
      struct.addMember('value').float64();

      const result = struct.parse(view, 0);
      expect(result.value).toBeCloseTo(value);
    });

    it('should return float64 value using big endian', () => {
      view.setFloat64(0, value, false);
      struct.addMember('value').float64({ littleEndian: false });

      const result = struct.parse(view, 0);
      expect(result.value).toBeCloseTo(value);
    });

    it('should return null for invalid offset', () => {
      view.setUint32(0, 0, true);
      struct.addMember('value').pointer({ allowNullPointer: false }).float64();

      const result = struct.parse(view, 0);
      expect(result.value).toBeNull();
    });

    it('should log debugging info in console', () => {
      const offset = 4;
      view.setFloat64(offset, value, true);

      struct = createStruct();
      struct.addMember('value').float64({ debug: true });

      struct.parse(view, offset);
      expect(consoleSpy).toHaveBeenCalledOnce();

      const debugInfo = consoleSpy.mock.calls[0];
      expect(debugInfo[0]).toBe('value');
      expect(debugInfo[1]).toBe(offset);
      expect(debugInfo[2]).toBeCloseTo(value);
    });
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
});
