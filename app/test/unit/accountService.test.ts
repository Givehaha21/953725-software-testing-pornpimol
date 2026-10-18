import { toPublicUser } from '../../src/services/accountService';
import { User } from '../../src/domain/types';

describe('toPublicUser', () => {
    it('returns user data without exposing the password hash', () => {
        // Arrange: เตรียมข้อมูลผู้ใช้แบบเต็ม รวม passwordHash
        const user: User = {
            id: 1,
            nationalId: '1509900000017',
            passwordHash: 'hashed-secret-password',
            firstName: 'Pornpimol',
            lastName: 'Sukjai',
            address: 'เชียงใหม่',
            districtId: 'CM-01',
            role: 'VOTER',
        };

        // Act: เรียกฟังก์ชันที่ต้องการทดสอบ
        const publicUser = toPublicUser(user);

        // Assert: ตรวจว่าข้อมูลที่ส่งกลับไม่มี passwordHash
        expect(publicUser).toEqual({
            id: 1,
            nationalId: '1509900000017',
            firstName: 'Pornpimol',
            lastName: 'Sukjai',
            address: 'เชียงใหม่',
            districtId: 'CM-01',
            role: 'VOTER',
        });
        expect(publicUser).not.toHaveProperty('passwordHash');
    });
});