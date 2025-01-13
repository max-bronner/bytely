import type { ParsedData, Offset, ParserCallback, Member } from './types';

const BYTE_SIZE_1 = 1;
const BYTE_SIZE_4 = 4;

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
    parse,
  };

  return publicMethods;
};
