import { createMember } from './createMember';
import type { Struct, Member, ParsedData } from './types';

export const createStruct = <T extends ParsedData>(struct?: Struct<Partial<T>>): Struct<T> => {
  let currentOffset: number = 0;
  const members: Member[] = struct ? [...struct.members] : [];
  const addMember = (name: keyof T) => {
    const member = createMember(name);
    members.push(member);
    return member;
  };

  const parse = (view: DataView, offset: number, reset: boolean = true): T => {
    const data: T = {} as T;
    currentOffset = offset ?? currentOffset;
    members.forEach((member) => {
      currentOffset += member.parse(view, currentOffset, data);
    });
    if (reset) {
      currentOffset = 0;
    }

    return data;
  };

  const getCurrentOffset = () => {
    return currentOffset;
  };

  const setCurrentOffset = (offset: number) => {
    currentOffset = offset;
  };

  return {
    members,
    getCurrentOffset,
    setCurrentOffset,
    addMember,
    parse,
  };
};
