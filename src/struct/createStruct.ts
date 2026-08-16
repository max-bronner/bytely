import { createMember } from './createMember';
import type { Struct, Member, MemberBuilder, ParsedData } from './types';

export const createStruct = <T extends ParsedData = ParsedData>(struct?: Struct<any>): Struct<T> => {
  const members: Member[] = struct ? [...struct.members] : [];

  const addMember = <K extends keyof T & string>(name: K) => {
    const member = createMember(name);
    members.push(member);
    return member as unknown as MemberBuilder<T, T[K]>;
  };

  const read = (view: DataView, offset: number): { data: T; size: number } => {
    const data: ParsedData = {};
    let cursor = offset;

    members.forEach((member) => {
      cursor += member.parse(view, cursor, data);
    });

    const size = cursor - offset;

    return { data: data as T, size };
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
