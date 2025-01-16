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

