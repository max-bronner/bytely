export type ParsedData = Record<string, any>;

export interface Member {
  name: string;
}

export interface Struct<T extends ParsedData> {
  members: Member[];
  addMember(name: keyof T): void;
  parse(view: DataView): void;
}
