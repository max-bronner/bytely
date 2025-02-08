import { describe, it, expect } from 'vitest';
import { createStruct } from '../../src/struct/createStruct';

describe('createStruct', () => {
  it('should return 0 members', () => {
    const struct = createStruct();
    expect(struct.members).toHaveLength(0);
  });

  it('should return manually set offset', () => {
    const struct = createStruct();
    struct.setCurrentOffset(100);
    expect(struct.getCurrentOffset()).toBe(100);
  });

  it('should return extended struct with members of original struct', () => {
    const originalStruct = createStruct();
    originalStruct.addMember('test').uint8();

    const newStruct = createStruct(originalStruct);
    expect(newStruct.members).toHaveLength(1);
  });
});
