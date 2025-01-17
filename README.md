# Bytely

`bytely` is a easy-to-use library for parsing binary data into structured objects. It provies an API for defining data structures in a similar way as low-level languages, specifically C. Through features like nesting, custom callbacks and debugging, `bytely` offers a flexible approach to work with complex binary data in a simple, clear and type-safe manner.

---

## Installation

Install the `bytely` package via npm:

```bash
npm install bytely
```

---

## Usage

### Importing Bytely

```typescript
import { createStruct } from 'bytely';
```

### Defining Structures

Use `createStruct` to define a structure, and `addMember` to add members to the structure:

```typescript
const exampleStruct = createStruct();
exampleStruct.addMember('name').pointer().string();
exampleStruct.addMember('red').uint8();
exampleStruct.addMember('green').uint8();
exampleStruct.addMember('blue').uint8();
exampleStruct.addMember('number').uint32();
```

### Parsing Data

Once you've defined your structure, use its `parse` method to parse a `DataView`:

```typescript
const view = new DataView(buffer); // DataView of buffer as argument

const data = exampleStruct.parse(view);
```

### Example

```typescript
// Example binary data setup
const buffer = new ArrayBuffer(20);
const view = new DataView(buffer);
view.setUint32(0, 12, true); // pointer to name (offset 12)
view.setUint8(4, 102); // red
view.setUint8(5, 51); // green
view.setUint8(6, 153); // blue
view.setUint32(7, 12345678, true); // number
const nameBuffer = new TextEncoder().encode('Example');
new Uint8Array(buffer).set(nameBuffer, 12);

// Parsing data
const parsedData = exampleStruct.parse(view);
console.log(parsedData);
// Output: { name: 'Example', red: 102, green: 51, blue: 153, number: 12345678 }
```

### Extending existing structs

You can extend existing structs to reuse and adapt already existing definitions by passing an existing structure as argument to `createStruct`:

```typescript
const point2DStruct = createStruct();
point2DStruct.addMember('id').uint32();
point2DStruct.addMember('x').float32();
point2DStruct.addMember('y').float32();

const point3DStruct = createStruct(point2DStruct);
point3DStruct.addMember('z').float32();
```

### Nested Structures

Define nested structures to parse hierarchical data:

```typescript
const pointStruct = createStruct();
pointStruct.addMember('x').float32();
pointStruct.addMember('y').float32();

// nested struct inside another struct
const triangleStruct = createStruct();
point2DStruct.addMember('point1').pointer().struct(pointStruct);
point2DStruct.addMember('point2').pointer().struct(pointStruct);
point2DStruct.addMember('point3').pointer().struct(pointStruct);

// handling of arrays
const pointCloudStruct = createStruct();
pointCloudStruct.addMember('pointCount').uint32();
pointCloudStruct.addMember('points').pointer().array('pointCount').struct(pointStruct);
```

---

## API Reference

### `createStruct`

Creates a new structure for parsing binary data.

```typescript
createStruct<T>();
createStruct<T>(existingStruct);
```

### `addMember`

Adds a member to the structure.

#### Supported Data Types

- `uint8`, `uint16`, `uint32`, `int32`
- `float32`
- `pointer`
- `string`
- `struct`, `structByType`
- `array`
- `custom`

---

## License

This project is licensed under the MIT License.

---

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests on GitHub.
