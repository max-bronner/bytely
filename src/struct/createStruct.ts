import { createMember } from './createMember';
import type { Struct, Member, ParsedData } from './types';

export const createStruct = <T extends ParsedData>(struct?: Struct<Partial<T>>): Struct<T> => {
  const members: Member[] = struct ? [...struct.members] : [];

  const addMember = (name: keyof T) => {
    const member = createMember(name);
    members.push(member);
    return member;
  };

  const read = (view: DataView, offset: number): { data: T; size: number } => {
    const data = {} as T;
    let cursor = offset;

    members.forEach((member) => {
      cursor += member.parse(view, cursor, data);
    });

    const size = cursor - offset;

    return { data, size };
  };

  const parse = (view: DataView, offset: number = 0): T => {
    const { data } = read(view, offset);

    return data;
  };

  return {
    members,
    addMember,
    read,
    parse,
  };
};
