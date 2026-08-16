import { roundUp } from '../utilities/utilities';
import type {
  ParsedData,
  Offset,
  Struct,
  ParserCallback,
  CustomCallback,
  PointerOptions,
  BaseOptions,
  Member,
  StructMap,
} from './types';

const POINTER_SIZE = 4;
const STRING_ALIGNMENT = 4;

const decoder = new TextDecoder();

type NumericReader = (view: DataView, offset: number, littleEndian: boolean) => number | bigint;

export const createMember = (name: string): Member => {
  const callbacks: ParserCallback[] = [];
  let byteSize = 0;

  const log = (debug: boolean | undefined, offset: number, value: unknown) => {
    if (debug) console.debug(name, offset, value);
  };

  const numeric =
    (size: number, read: NumericReader) =>
    (options: BaseOptions = {}) => {
      const { debug, littleEndian = true } = options;
      callbacks.push((view, offset) => {
        const result = read(view, offset, littleEndian);
        if (!byteSize) byteSize = size;
        log(debug, offset, result);
        return result;
      });
    };

  const int8 = numeric(1, (view, offset) => view.getInt8(offset));
  const uint8 = numeric(1, (view, offset) => view.getUint8(offset));
  const int16 = numeric(2, (view, offset, littleEndian) => view.getInt16(offset, littleEndian));
  const uint16 = numeric(2, (view, offset, littleEndian) => view.getUint16(offset, littleEndian));
  const int32 = numeric(4, (view, offset, littleEndian) => view.getInt32(offset, littleEndian));
  const uint32 = numeric(4, (view, offset, littleEndian) => view.getUint32(offset, littleEndian));
  const int64 = numeric(8, (view, offset, littleEndian) => view.getBigInt64(offset, littleEndian));
  const uint64 = numeric(8, (view, offset, littleEndian) => view.getBigUint64(offset, littleEndian));
  const float32 = numeric(4, (view, offset, littleEndian) => view.getFloat32(offset, littleEndian));
  const float64 = numeric(8, (view, offset, littleEndian) => view.getFloat64(offset, littleEndian));

  const pointer = (options: PointerOptions = {}) => {
    const { debug, littleEndian = true, allowNullPointer = false } = options;
    callbacks.push((view, offset) => {
      const address = view.getUint32(offset, littleEndian);
      if (!byteSize) byteSize = POINTER_SIZE;
      log(debug, offset, address);
      return allowNullPointer || address !== 0 ? address : null;
    });
    return publicMethods;
  };

  const string = (options: BaseOptions = {}) => {
    const { debug } = options;
    callbacks.push((view, offset) => {
      const charArray = new Uint8Array(view.buffer, view.byteOffset + offset);
      const nullIndex = charArray.indexOf(0);
      const result = decoder.decode(charArray.subarray(0, nullIndex));
      if (!byteSize) byteSize = roundUp(nullIndex, STRING_ALIGNMENT);
      log(debug, offset, result);
      return result;
    });
  };

  const struct = (struct: Struct<any>, options: BaseOptions = {}) => {
    const { debug } = options;
    callbacks.push((view, offset) => {
      const { data, size } = struct.read(view, offset);
      if (!byteSize) byteSize = size;
      log(debug, offset, data);
      return data;
    });
  };

  const structByType = (structMap: StructMap, options: BaseOptions = {}) => {
    const { debug } = options;
    callbacks.push((view, offset) => {
      const type = view.getUint8(offset);
      const struct = structMap[type];
      if (!struct) throw Error(`Missing type: Type ${type} not found in mappings`);
      const { data, size } = struct.read(view, offset);
      if (!byteSize) byteSize = size;
      log(debug, offset, data);
      return data;
    });
  };

  const array = (count: number | string, options: BaseOptions = {}) => {
    const { debug } = options;
    const arrayMember = createMember('element');
    callbacks.push((view, offset, data) => {
      // todo: add exception if no number and no data key
      const length = typeof count === 'number' ? count : (data[count] as number);
      const arrayData = [];
      let parsedBytes = 0;
      for (let i = 0; i < length; i++) {
        const entry: { element?: unknown } = {};
        parsedBytes += arrayMember.parse(view, offset + parsedBytes, entry);
        arrayData.push(entry.element);
      }
      if (!byteSize) byteSize = parsedBytes;
      log(debug, offset, arrayData);
      return arrayData;
    });
    return arrayMember;
  };

  const custom = (customCallback: CustomCallback, options: BaseOptions = {}) => {
    const { debug } = options;
    callbacks.push((view, offset, data) => {
      const { byteSize: size, result } = customCallback(view, offset, data);
      if (!byteSize) byteSize = size;
      log(debug, offset, result);
      return result;
    });
    return publicMethods;
  };

  const parse = (view: DataView, offset: number, data: ParsedData): number => {
    let cursor: Offset = offset;
    for (const callback of callbacks) {
      if (cursor === null) break;
      cursor = callback(view, cursor, data) as Offset;
    }
    data[name] = cursor;
    const size = byteSize;
    byteSize = 0;
    return size;
  };

  const publicMethods: Member = {
    pointer,
    int8,
    uint8,
    int16,
    uint16,
    int32,
    uint32,
    int64,
    uint64,
    float32,
    float64,
    string,
    struct,
    structByType,
    array,
    custom,
    parse,
  };

  return publicMethods;
};
