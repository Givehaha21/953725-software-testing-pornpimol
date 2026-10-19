import { AccountService, Registration, toPublicUser } from '../../src/services/accountService';
import { TokenService } from '../../src/auth/tokenService';
import { User } from '../../src/domain/types';
import { DistrictRepository } from '../../src/repositories/districtRepository';
import { UserRepository } from '../../src/repositories/userRepository';

describe('toPublicUser', () => {
    it('returns user data without exposing the password hash', () => {
        // Arrange
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

        // Act
        const publicUser = toPublicUser(user);

        // Assert
        expect(publicUser).not.toHaveProperty('passwordHash');
    });
});

describe('AccountService', () => {
    describe('register', () => {
        it('registers a voter in an existing district', async () => {
            // Arrange
            const registration: Registration = {
                nationalId: '1509900000017',
                password: 'voter1234',
                firstName: 'Pornpimol',
                lastName: 'Sukjai',
                address: 'เชียงใหม่',
                districtId: 'CM-1',
            };

            const users: UserRepository = {
                findById: async () => null,
                findByNationalId: async () => null,
                create: async (newUser) => ({ id: 1, ...newUser, role: 'VOTER' }),
                updateRole: async () => null,
            };

            const districts: DistrictRepository = {
                findAll: async () => [],
                // Stub: กำหนดผลตอบกลับของ dependency ให้เขต CM-1 มีอยู่จริง
                findById: async (id) => (id === 'CM-1' ? { id: 'CM-1', province: 'เชียงใหม่', number: 1 } : null),
            };

            const tokens: TokenService = {
                // Dummy: ส่งให้ constructor ครบ แต่ register() ไม่ควรเรียกใช้
                issue: () => {
                    throw new Error('dummy should not be used');
                },
                verify: () => {
                    throw new Error('dummy should not be used');
                },
            };

            const service = new AccountService(users, districts, tokens);

            // Act
            const voter = await service.register(registration);

            // Assert
            expect(voter).toEqual({
                id: 1,
                nationalId: '1509900000017',
                firstName: 'Pornpimol',
                lastName: 'Sukjai',
                address: 'เชียงใหม่',
                districtId: 'CM-1',
                role: 'VOTER',
            });
        });
    });
});