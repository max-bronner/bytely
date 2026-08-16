import { createStruct } from '../../src/struct/createStruct';
import type { ParsedData } from '../../src/struct/types';

declare const view: DataView;

type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;
const expectType =
  <Expected>() =>
  <Actual>(_actual: Actual, _ok: Equals<Actual, Expected> extends true ? true : never) =>
    undefined;

interface Point {
  x: number;
  y: number;
}

interface Example {
  name: string | null;
  red: number;
  big: bigint;
  point: Point;
  count: number;
  points: Point[] | null;
  raw: number;
}

const point = createStruct<Point>();
point.addMember('x').float32();
point.addMember('y').float32();

const example = createStruct<Example>();

example.addMember('name').pointer().string();
example.addMember('red').uint8();
example.addMember('big').int64();
example.addMember('point').struct(point);
example.addMember('count').uint32();
example.addMember('points').pointer().array('count').struct(point);
example.addMember('raw').custom((currentView, offset) => ({
  byteSize: 4,
  result: currentView.getUint32(offset, true),
}));

example.addMember('red').uint8({ debug: true });
example.addMember('red').uint8({ littleEndian: false });
example.addMember('name').pointer({ allowNullPointer: true }).string({ debug: true });
example.addMember('points').pointer().array('count', { debug: true }).struct(point, { debug: true });

expectType<Example>()(example.parse(view), true);
expectType<Example>()(example.parse(view, 8), true);
expectType<{ data: Example; size: number }>()(example.read(view, 0), true);
expectType<Point>()(point.parse(view), true);

// @ts-expect-error declared string | null, parsed as number
example.addMember('name').uint32();
// @ts-expect-error declared number, parsed as bigint
example.addMember('red').uint64();
// @ts-expect-error declared bigint, parsed as number
example.addMember('big').float32();
// @ts-expect-error declared number, parsed as string
example.addMember('red').string();
// @ts-expect-error declared string | null, parsed as Point
example.addMember('name').struct(point);
// @ts-expect-error declared string | null, parsed as Point
example.addMember('name').structByType({ 1: point });
// @ts-expect-error Point is not an array
example.addMember('point').array(4).float32();
// @ts-expect-error custom callback returns number, member declared as Point
example.addMember('point').custom((v, o) => ({ byteSize: 4, result: v.getUint32(o, true) }));
// @ts-expect-error 'nope' is not a member of Example
example.addMember('nope').uint8();
// @ts-expect-error 'coun' is not a numeric member of Example
example.addMember('points').pointer().array('coun').struct(point);
// @ts-expect-error 'name' is not a numeric member of Example
example.addMember('points').pointer().array('name').struct(point);

interface Tagged {
  body: Point;
}
const tagged = createStruct<Tagged>();
tagged.addMember('body').structByType({ 1: point, 2: point });

const loose = createStruct();
loose.addMember('anything').uint8();
loose.addMember('other').string();
loose.addMember('sub').struct(point);
loose.addMember('list').array('anything').uint8();
loose.addMember('viaType').structByType({ 1: point });
expectType<ParsedData>()(loose.parse(view), true);

const looseSub = createStruct();
looseSub.addMember('x').float32();
example.addMember('point').struct(looseSub);

declare const version: number;
if (version > 2) {
  example.addMember('red').uint8();
}
const addPoint = (target: typeof example) => target.addMember('point').struct(point);
addPoint(example);

interface Point3D extends Point {
  z: number;
}
const point3D = createStruct<Point3D>(point);
point3D.addMember('z').float32();
expectType<Point3D>()(point3D.parse(view), true);
