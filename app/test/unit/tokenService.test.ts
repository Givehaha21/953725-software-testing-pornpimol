import { JwtTokenService } from '../../src/auth/tokenService';

describe('JwtTokenService', () => {
    afterEach(() => {
        jest.useRealTimers();
    });

    it('returns null when a token has expired', () => {
        // Arrange — ล็อกเวลาเริ่มต้น จึงไม่ต้องรอเวลาจริง
        jest.useFakeTimers({ now: new Date('2026-10-03T02:00:00.000Z') });
        const tokens = new JwtTokenService('test-secret', 60);

        // Act — ออก token ที่มีอายุ 60 วินาที แล้วขยับเวลาไป 61 วินาที
        const token = tokens.issue({
            userId: 1,
            role: 'VOTER',
            districtId: 'CM-1',
        });
        jest.setSystemTime(new Date('2026-10-03T02:01:01.000Z'));

        // Assert
        expect(tokens.verify(token)).toBeNull();
    });
});