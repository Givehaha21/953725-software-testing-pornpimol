import { isValidThaiNationalId } from '../../src/domain/thaiNationalId';

describe('isValidThaiNationalId', () => {
  it.each([
    ['accepts a valid ID with a correct checksum', '1509900000017', true],
    ['accepts another valid ID with a correct checksum', '1100000000016', true],
    ['rejects an ID with a wrong checksum digit', '1509900000018', false],
    ['rejects an ID with 12 digits, below the length boundary', '150990000001', false],
    ['rejects an ID with 14 digits, above the length boundary', '15099000000170', false],
    ['rejects an ID containing non-numeric characters', 'abcdefghijklm', false],
  ])('%s', (_description, id, expected) => {
    // Arrange: test data comes from the table above

    // Act
    const valid = isValidThaiNationalId(id);

    // Assert
    expect(valid).toBe(expected);
  });
});