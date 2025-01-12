export type ParsedData = Record<string, any>;

export type Offset = number | null;

export type ParserCallback = (view: DataView, offset: Offset, data: ParsedData) => any;

export interface Member {
  pointer(): Member;
  uint8(): void;
  parse(view: DataView, offset: number, structData: ParsedData): number;
}

export interface Struct<T extends ParsedData> {
  members: Member[];
  addMember(name: keyof T): Member;
  parse(view: DataView, offset?: number, reset?: boolean): T;
}
