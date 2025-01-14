export type ParsedData = Record<string, any>;

export type StructMap = Record<number, Struct<ParsedData>>;

export type Offset = number | null;

export type ParserCallback = (view: DataView, offset: Offset, data: ParsedData) => any;
export type CustomCallback = (view: DataView, offset: number, data: ParsedData) => { byteSize: number; result: any };

export interface BaseOptions {
  debug?: boolean;
}
export interface PointerOptions extends BaseOptions {
  allowNullPointer?: boolean;
}

export interface Member {
  pointer(options?: PointerOptions): Member;
  uint8(options?: BaseOptions): void;
  uint16(options?: BaseOptions): void;
  int32(options?: BaseOptions): void;
  uint32(options?: BaseOptions): void;
  float32(options?: BaseOptions): void;
  string(options?: BaseOptions): void;
  struct(struct: Struct<ParsedData>, options?: BaseOptions): void;
  structByType(structMap: StructMap, options?: BaseOptions): void;
  array(count: number | string, options?: BaseOptions): Member;
  custom(customCallback: CustomCallback, options?: BaseOptions): Member;
  parse(view: DataView, offset: number, structData: ParsedData): number;
}

export interface Struct<T extends ParsedData> {
  members: Member[];
  getCurrentOffset(): number;
  setCurrentOffset(offset: number): void;
  addMember(name: keyof T): Member;
  parse(view: DataView, offset?: number, reset?: boolean): T;
}
