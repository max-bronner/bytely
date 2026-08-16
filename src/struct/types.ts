export type ParsedData = Record<string, any>;

export type StructMap = Record<number, Struct<any>>;

export type Offset = number | null;

export type ParserCallback = (view: DataView, offset: number, data: ParsedData) => unknown;
export type CustomCallback<R = any> = (
  view: DataView,
  offset: number,
  data: ParsedData,
) => { byteSize: number; result: R };

export interface BaseOptions {
  debug?: boolean;
  littleEndian?: boolean;
}
export interface PointerOptions extends BaseOptions {
  allowNullPointer?: boolean;
}

type IsAny<V> = 0 extends 1 & V ? true : false;

type IsLoose<T> = string extends keyof T ? true : false;

type Label<T> =
  IsAny<T> extends true
    ? 'any'
    : [T] extends [never]
      ? 'never'
      : [NonNullable<T>] extends [readonly unknown[]]
        ? 'an array'
        : [NonNullable<T>] extends [string]
          ? 'a string'
          : [NonNullable<T>] extends [number]
            ? 'a number'
            : [NonNullable<T>] extends [bigint]
              ? 'a bigint'
              : [NonNullable<T>] extends [boolean]
                ? 'a boolean'
                : [NonNullable<T>] extends [object]
                  ? 'a struct'
                  : 'an unsupported type';

type Reject<Method extends string, Declared> =
  `bytely: this member is declared as ${Label<Declared>}, so ${Method}() cannot parse it`;

type Accepts<V, ParsedAs, Method extends string> = IsAny<V> extends true
  ? unknown
  : [ParsedAs] extends [V]
    ? unknown
    : Reject<Method, V>;

type AcceptsShape<V, D, Method extends string> = IsAny<V> extends true
  ? unknown
  : IsLoose<D> extends true
    ? unknown
    : [D] extends [V]
      ? unknown
      : Reject<Method, V>;

type IsArrayLike<V> = IsAny<V> extends true ? true : [NonNullable<V>] extends [readonly unknown[]] ? true : false;

type ElementOf<V> = IsAny<V> extends true ? any : NonNullable<V> extends readonly (infer E)[] ? E : any;

type ShapeOf<Map> = { [K in keyof Map]: Map[K] extends Struct<infer D> ? D : never }[keyof Map];

type NumericKeys<T> = { [K in keyof T]: T[K] extends number ? K : never }[keyof T] & string;
type CountKeys<T> = IsLoose<T> extends true ? string : NumericKeys<T>;

export interface MemberBuilder<T extends ParsedData, V> {
  int8(this: Accepts<V, number, 'int8'>, options?: BaseOptions): void;
  uint8(this: Accepts<V, number, 'uint8'>, options?: BaseOptions): void;
  int16(this: Accepts<V, number, 'int16'>, options?: BaseOptions): void;
  uint16(this: Accepts<V, number, 'uint16'>, options?: BaseOptions): void;
  int32(this: Accepts<V, number, 'int32'>, options?: BaseOptions): void;
  uint32(this: Accepts<V, number, 'uint32'>, options?: BaseOptions): void;
  int64(this: Accepts<V, bigint, 'int64'>, options?: BaseOptions): void;
  uint64(this: Accepts<V, bigint, 'uint64'>, options?: BaseOptions): void;
  float32(this: Accepts<V, number, 'float32'>, options?: BaseOptions): void;
  float64(this: Accepts<V, number, 'float64'>, options?: BaseOptions): void;
  string(this: Accepts<V, string, 'string'>, options?: BaseOptions): void;
  struct<D extends ParsedData>(this: AcceptsShape<V, D, 'struct'>, struct: Struct<D>, options?: BaseOptions): void;
  structByType<Map extends StructMap>(
    this: AcceptsShape<V, ShapeOf<Map>, 'structByType'>,
    structMap: Map,
    options?: BaseOptions,
  ): void;
  array(
    this: IsArrayLike<V> extends true ? unknown : Reject<'array', V>,
    count: number | CountKeys<T>,
    options?: BaseOptions,
  ): MemberBuilder<T, ElementOf<V>>;
  pointer(options?: PointerOptions): MemberBuilder<T, NonNullable<V>>;
  custom(callback: CustomCallback<V>, options?: BaseOptions): MemberBuilder<T, V>;
}

export interface Member extends MemberBuilder<ParsedData, any> {
  parse(view: DataView, offset: number, structData: ParsedData): number;
}

export interface Struct<T extends ParsedData = ParsedData> {
  members: Member[];
  addMember<K extends keyof T & string>(name: K): MemberBuilder<T, T[K]>;
  read(view: DataView, offset: number): { data: T; size: number };
  parse(view: DataView, offset?: number): T;
}
