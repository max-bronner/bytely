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

const BYTE_SIZE_1 = 1;
const BYTE_SIZE_2 = 2;
const BYTE_SIZE_4 = 4;

const decoder = new TextDecoder();

export const createMember = <T extends ParsedData>(name: keyof T): Member => {
  // todo: extract repeating logic from parsing functions
  let byteSize = 0;
  const callbacks: ParserCallback[] = [];

  const pointer = (options: PointerOptions = {}) => {
    const { debug, allowNullPointer = false } = options;
    callbacks.push((view: DataView, offset: Offset) => {
      if (offset === null) return null;
      const result = view.getUint32(offset, true);
      byteSize ||= BYTE_SIZE_4;
      if (debug) console.debug(name, offset, result);
      return allowNullPointer || result !== 0 ? result : null;
    });
    return publicMethods;
  };

  const uint8 = (options: BaseOptions = {}) => {
    const { debug } = options;
    callbacks.push((view: DataView, offset: Offset) => {
      if (offset === null) return null;
      const result = view.getUint8(offset);
      byteSize ||= BYTE_SIZE_1;
      if (debug) console.debug(name, offset, result);
      return result;
    });
  };

  const uint16 = (options: BaseOptions = {}) => {
    const { debug } = options;
    callbacks.push((view: DataView, offset: Offset) => {
      if (offset === null) return null;
      const result = view.getUint16(offset, true);
      byteSize ||= BYTE_SIZE_2;
      if (debug) console.debug(name, offset, result);
      return result;
    });
  };

  const int32 = (options: BaseOptions = {}) => {
    const { debug } = options;
    callbacks.push((view: DataView, offset: Offset) => {
      if (offset === null) return null;
      const result = view.getInt32(offset, true);
      byteSize ||= BYTE_SIZE_4;
      if (debug) console.debug(name, offset, result);
      return result;
    });
  };

  const uint32 = (options: BaseOptions = {}) => {
    const { debug } = options;
    callbacks.push((view: DataView, offset: Offset) => {
      if (offset === null) return null;
      const result = view.getUint32(offset, true);
      byteSize ||= BYTE_SIZE_4;
      if (debug) console.debug(name, offset, result);
      return result;
    });
  };

  const float32 = (options: BaseOptions = {}) => {
    const { debug } = options;
    callbacks.push((view: DataView, offset: Offset) => {
      if (offset === null) return null;
      const result = view.getFloat32(offset, true);
      byteSize ||= BYTE_SIZE_4;
      if (debug) console.debug(name, offset, result);
      return result;
    });
  };

  const string = (options: BaseOptions = {}) => {
    const { debug } = options;
    callbacks.push((view: DataView, offset: Offset) => {
      if (offset === null) return null;
      const charArray = new Uint8Array(view.buffer, offset);
      const nullIndex = charArray.indexOf(0);
      const stringArray = charArray.subarray(0, nullIndex);
      const result = decoder.decode(stringArray);
      byteSize ||= roundUp(nullIndex, 4);
      if (debug) console.debug(name, offset, result);
      return result;
    });
  };

  const struct = (struct: Struct<ParsedData>, options: BaseOptions = {}) => {
    const { debug } = options;
    callbacks.push((view: DataView, offset: Offset) => {
      if (offset === null) return null;
      const structData = struct.parse(view, offset, false);
      byteSize ||= struct.getCurrentOffset() - offset;
      if (debug) console.debug(name, offset, structData);
      return structData;
    });
  };

  const structByType = (structMap: StructMap, options: BaseOptions = {}) => {
    const { debug } = options;
    callbacks.push((view: DataView, offset: Offset) => {
      if (offset === null) return null;
      const type = view.getUint8(offset);
      const struct = structMap[type];
      if (!struct) throw Error(`Missing type: Type ${type} not found in mappings`);
      const structData = struct.parse(view, offset, false);
      byteSize ||= struct.getCurrentOffset() - offset;
      if (debug) console.debug(name, offset, structData);
      return structData;
    });
  };

  const array = (count: number | string, options: BaseOptions = {}) => {
    const { debug } = options;
    const arrayMember = createMember('array');
    callbacks.push((view: DataView, offset: Offset, data) => {
      if (offset === null) return null;
      // todo: add exception if no number and no data key
      const iterations = typeof count === 'number' ? count : (data[count] as number);
      const arrayData = [];
      let parsedBytes = 0;
      for (let i = 0; i < iterations; i++) {
        const entryData: { array?: any } = {};
        parsedBytes += arrayMember.parse(view, offset + parsedBytes, entryData);
        arrayData.push(entryData.array);
      }
      byteSize ||= parsedBytes;
      if (debug) console.debug(name, offset, arrayData);
      return arrayData;
    });
    return arrayMember;
  };

  const custom = (customCallback: CustomCallback, options: BaseOptions = {}) => {
    const { debug } = options;
    callbacks.push((view: DataView, offset: Offset, data) => {
      if (offset === null) return null;
      const { byteSize: size, result } = customCallback(view, offset, data);
      byteSize ||= size;
      if (debug) console.debug(name, offset, result);
      return result;
    });
    return publicMethods;
  };

  const parse = (view: DataView, offset: number, data: Partial<T>) => {
    const memberData = callbacks.reduce((acc: number, callback: ParserCallback) => {
      return callback(view, acc, data);
    }, offset);
    data[name] = memberData as T[keyof T];
    const finalByteSize = byteSize;
    byteSize = 0;
    return finalByteSize;
  };

  const publicMethods: Member = {
    pointer,
    uint8,
    uint16,
    int32,
    uint32,
    float32,
    string,
    struct,
    structByType,
    array,
    custom,
    parse,
  };

  return publicMethods;
};
