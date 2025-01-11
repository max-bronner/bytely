import type { Struct, Member, ParsedData } from './types';

export const createStruct = <T extends ParsedData>(struct?: Struct<Partial<T>>): Struct<T> => {
  const members: Member[] = struct ? [...struct.members] : [];
  const addMember = (name: keyof T) => {
    console.log(name);
  };

  const parse = (view: DataView) => {
    console.log(view);
  };

  return {
    members,
    addMember,
    parse,
  };
};
