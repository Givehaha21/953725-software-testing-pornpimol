import { AccountService, Registration, toPublicUser } from '../../src/services/accountService';
import { TokenService } from '../../src/auth/tokenService';
import { Role, User } from '../../src/domain/types';
import { DistrictRepository } from '../../src/repositories/districtRepository';
import { NewUser, UserRepository } from '../../src/repositories/userRepository';
import { ConflictError, UnauthorizedError, ValidationError } from '../../src/errors';
import { hashPassword } from '../../src/auth/passwords';

class InMemoryUserRepository implements UserRepository {
    constructor(private readonly users: User[] = []) { }

    async findById(id: number): Promise<User | null> {
        return this.users.find((user) => user.id === id) ?? null;
    }

    async findByNationalId(nationalId: string): Promise<User | null> {
        return this.users.find((user) => user.nationalId === nationalId) ?? null;
    }

    async create(newUser: NewUser): Promise<User> {
        const nextId = Math.max(0, ...this.users.map((user) => user.id)) + 1;
        const user: User = { id: nextId, ...newUser, role: 'VOTER' };
        this.users.push(user);
        return user;
    }

    async updateRole(id: number, role: Role): Promise<User | null> {
        const user = await this.findById(id);
        if (!user) return null;
        user.role = role;
        return user;
    }
}

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
                // Stub: กำหนดผลตอบกลับให้เขต CM-1 มีอยู่จริง
                findById: async (id) => (id === 'CM-1' ? { id: 'CM-1', province: 'เชียงใหม่', number: 1 } : null),
            };

            const tokens: TokenService = {
                // Dummy: register() ไม่ควรเรียกใช้ token
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

        it('stores a hash, never the plain-text password', async () => {
            // Arrange
            const registration: Registration = {
                nationalId: '1509900000017',
                password: 'voter1234',
                firstName: 'Pornpimol',
                lastName: 'Sukjai',
                address: 'เชียงใหม่',
                districtId: 'CM-1',
            };

            // Spy: บันทึกข้อมูลที่ส่งให้ create() เพื่อตรวจสอบหลังเรียก service
            const create = jest.fn(async (newUser: NewUser): Promise<User> => ({
                id: 1,
                ...newUser,
                role: 'VOTER',
            }));

            const users: UserRepository = {
                findById: async () => null,
                findByNationalId: async () => null,
                create,
                updateRole: async () => null,
            };

            const districts: DistrictRepository = {
                findAll: async () => [],
                findById: async () => ({ id: 'CM-1', province: 'เชียงใหม่', number: 1 }),
            };

            const tokens: TokenService = {
                // Dummy: register() ไม่ควรเรียกใช้ token
                issue: () => {
                    throw new Error('dummy should not be used');
                },
                verify: () => {
                    throw new Error('dummy should not be used');
                },
            };

            const service = new AccountService(users, districts, tokens);

            // Act
            await service.register(registration);

            // Assert
            expect(create).toHaveBeenCalledTimes(1);
            expect(create.mock.calls[0][0].passwordHash).not.toBe(registration.password);
        });

        it('rejects a national id that is already registered', async () => {
            // Arrange
            const existingUser: User = {
                id: 1,
                nationalId: '1509900000017',
                passwordHash: 'existing-password-hash',
                firstName: 'Existing',
                lastName: 'Voter',
                address: 'เชียงใหม่',
                districtId: 'CM-1',
                role: 'VOTER',
            };

            // Fake: implementation จริงแบบง่าย เก็บข้อมูลใน array แทนฐานข้อมูล
            const users = new InMemoryUserRepository([existingUser]);

            const districts: DistrictRepository = {
                findAll: async () => [],
                findById: async () => ({ id: 'CM-1', province: 'เชียงใหม่', number: 1 }),
            };

            const tokens: TokenService = {
                // Dummy: register() ไม่ควรเรียกใช้ token
                issue: () => {
                    throw new Error('dummy should not be used');
                },
                verify: () => {
                    throw new Error('dummy should not be used');
                },
            };

            const service = new AccountService(users, districts, tokens);

            const registration: Registration = {
                nationalId: '1509900000017',
                password: 'voter1234',
                firstName: 'Pornpimol',
                lastName: 'Sukjai',
                address: 'เชียงใหม่',
                districtId: 'CM-1',
            };

            // Act
            const result = service.register(registration);

            // Assert
            await expect(result).rejects.toThrow(ConflictError);
        });
        it('does not save anything when the national id is invalid', async () => {
            // Arrange
            const registration: Registration = {
                nationalId: '1509900000018',
                password: 'voter1234',
                firstName: 'Pornpimol',
                lastName: 'Sukjai',
                address: 'เชียงใหม่',
                districtId: 'CM-1',
            };

            // Mock: ตั้ง expectation ว่า create() ต้องไม่ถูกเรียก
            const create = jest.fn(async (_newUser: NewUser): Promise<User> => {
                throw new Error('create should not be called');
            });

            const users: UserRepository = {
                findById: async () => null,
                findByNationalId: async () => null,
                create,
                updateRole: async () => null,
            };

            const districts: DistrictRepository = {
                findAll: async () => [],
                findById: async () => {
                    throw new Error('district should not be checked');
                },
            };

            const tokens: TokenService = {
                // Dummy: invalid national ID ต้องถูกปฏิเสธก่อนใช้ token
                issue: () => {
                    throw new Error('dummy should not be used');
                },
                verify: () => {
                    throw new Error('dummy should not be used');
                },
            };

            const service = new AccountService(users, districts, tokens);

            // Act
            const result = service.register(registration);

            // Assert
            await expect(result).rejects.toThrow(ValidationError);
            expect(create).not.toHaveBeenCalled();
        });
        it('rejects an unknown district', async () => {
            // Arrange
            const registration: Registration = {
                nationalId: '1509900000017',
                password: 'voter1234',
                firstName: 'Pornpimol',
                lastName: 'Sukjai',
                address: 'เชียงใหม่',
                districtId: 'UNKNOWN',
            };

            const users: UserRepository = {
                findById: async () => null,
                findByNationalId: async () => null,
                create: async () => {
                    throw new Error('create should not be called');
                },
                updateRole: async () => null,
            };

            const districts: DistrictRepository = {
                findAll: async () => [],
                // Stub: ควบคุมให้ district ที่ค้นหาไม่มีอยู่
                findById: async () => null,
            };

            const tokens: TokenService = {
                // Dummy: test นี้ไม่ควรใช้ token
                issue: () => {
                    throw new Error('dummy should not be used');
                },
                verify: () => {
                    throw new Error('dummy should not be used');
                },
            };

            const service = new AccountService(users, districts, tokens);

            // Act
            const result = service.register(registration);

            // Assert
            await expect(result).rejects.toThrow(ValidationError);
        });
    });
    describe('login', () => {
        it('issues a token for the user', async () => {
            // Arrange
            const user: User = {
                id: 1,
                nationalId: '1509900000017',
                passwordHash: hashPassword('voter1234'),
                firstName: 'Pornpimol',
                lastName: 'Sukjai',
                address: 'เชียงใหม่',
                districtId: 'CM-1',
                role: 'VOTER',
            };

            const users: UserRepository = {
                findById: async () => null,
                findByNationalId: async () => user,
                create: async () => {
                    throw new Error('create should not be called');
                },
                updateRole: async () => null,
            };

            const districts: DistrictRepository = {
                // Dummy: login() ไม่ควรใช้ district repository
                findAll: async () => {
                    throw new Error('dummy should not be used');
                },
                findById: async () => {
                    throw new Error('dummy should not be used');
                },
            };

            // Mock: กำหนด expectation ว่า issue() ต้องได้รับ principal ที่ถูกต้อง
            const issue = jest.fn().mockReturnValue('test-token');
            const tokens: TokenService = {
                issue,
                verify: () => null,
            };

            const service = new AccountService(users, districts, tokens);

            // Act
            const token = await service.login('1509900000017', 'voter1234');

            // Assert
            expect(token).toBe('test-token');
            expect(issue).toHaveBeenCalledWith({
                userId: 1,
                role: 'VOTER',
                districtId: 'CM-1',
            });
        });
        it('rejects a wrong password without issuing a token', async () => {
            // Arrange
            const user: User = {
                id: 1,
                nationalId: '1509900000017',
                passwordHash: hashPassword('voter1234'),
                firstName: 'Pornpimol',
                lastName: 'Sukjai',
                address: 'เชียงใหม่',
                districtId: 'CM-1',
                role: 'VOTER',
            };

            const users: UserRepository = {
                findById: async () => null,
                findByNationalId: async () => user,
                create: async () => {
                    throw new Error('create should not be called');
                },
                updateRole: async () => null,
            };

            const districts: DistrictRepository = {
                // Dummy: login() ไม่ควรใช้ district repository
                findAll: async () => {
                    throw new Error('dummy should not be used');
                },
                findById: async () => {
                    throw new Error('dummy should not be used');
                },
            };

            // Mock: ตรวจว่า issue() ต้องไม่ถูกเรียกเมื่อรหัสผ่านผิด
            const issue = jest.fn().mockReturnValue('test-token');
            const tokens: TokenService = {
                issue,
                verify: () => null,
            };

            const service = new AccountService(users, districts, tokens);

            // Act
            const result = service.login('1509900000017', 'wrong-password');

            // Assert
            await expect(result).rejects.toThrow(UnauthorizedError);
            expect(issue).not.toHaveBeenCalled();
        });
    });
    describe('changeRole', () => {
        it('refuses to make anyone an ADMIN', async () => {
            // Arrange
            // Mock: ตรวจว่า updateRole() ต้องไม่ถูกเรียกเมื่อ role ไม่อนุญาต
            const updateRole = jest.fn();

            const users: UserRepository = {
                findById: async () => null,
                findByNationalId: async () => null,
                create: async () => {
                    throw new Error('create should not be called');
                },
                updateRole,
            };

            const districts: DistrictRepository = {
                // Dummy: changeRole() ไม่ควรใช้ district repository
                findAll: async () => {
                    throw new Error('dummy should not be used');
                },
                findById: async () => {
                    throw new Error('dummy should not be used');
                },
            };

            const tokens: TokenService = {
                // Dummy: changeRole() ไม่ควรใช้ token service
                issue: () => {
                    throw new Error('dummy should not be used');
                },
                verify: () => {
                    throw new Error('dummy should not be used');
                },
            };

            const service = new AccountService(users, districts, tokens);

            // Act
            const result = service.changeRole(1, 'ADMIN');

            // Assert
            await expect(result).rejects.toThrow(ValidationError);
            expect(updateRole).not.toHaveBeenCalled();
        });
    });
});