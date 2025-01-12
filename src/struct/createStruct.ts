import { createMember } from './createMember';
import type { Struct, Member, ParsedData } from './types';

export const createStruct = <T extends ParsedData>(struct?: Struct<Partial<T>>): Struct<T> => {
  let currentOffset: number = 0;
  const members: Member[] = struct ? [...struct.members] : [];

  const addMember = (name: keyof T): Member => {
    const member = createMember(name);
    members.push(member);
    return member;
  };

  const parse = (view: DataView, offset: number): T => {
    const data: T = {} as T;
    currentOffset = offset ?? currentOffset;
    members.forEach((member) => {
      currentOffset += member.parse(view, currentOffset, data);
    });

    return data;
  };

  return {
    members,
    addMember,
    parse,
  };
};
