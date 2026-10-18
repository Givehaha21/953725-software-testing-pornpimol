import { isValidThaiNationalId } from '../../src/domain/thaiNationalId';

describe('isValidThaiNationalId', () => {
  it('accepts exactly 13 digits when the last digit matches the checksum', () => {
    const id = '1509900000017';

    const valid = isValidThaiNationalId(id);

    expect(valid).toBe(true);
  });

  it('rejects 12 digits, one below the required length boundary', () => {
    expect(isValidThaiNationalId('150990000001')).toBe(false);
  });

  it('rejects 14 digits, one above the required length boundary', () => {
    expect(isValidThaiNationalId('15099000000170')).toBe(false);
  });

  it('rejects an id with a wrong checksum digit', () => {
    expect(isValidThaiNationalId('1509900000018')).toBe(false);
  });

  it.each(['', '150990000001x'])('rejects malformed id "%s"', (id) => {
    expect(isValidThaiNationalId(id)).toBe(false);
  });
});
