import { hashPassword, verifyPassword } from '../../src/auth/passwords';

describe('passwords', () => {
    it('creates a hash that is different from the plain-text password', () => {
        // Arrange
        const password = 'voter1234';

        // Act
        const hash = hashPassword(password);

        // Assert
        expect(hash).not.toBe(password);
    });

    it('creates different hashes when the same password is hashed twice', () => {
        // Arrange
        const password = 'voter1234';

        // Act
        const firstHash = hashPassword(password);
        const secondHash = hashPassword(password);

        // Assert
        expect(firstHash).not.toBe(secondHash);
    });

    it('returns true when the password matches the stored hash', () => {
        // Arrange
        const password = 'voter1234';
        const storedHash = hashPassword(password);

        // Act
        const valid = verifyPassword(password, storedHash);

        // Assert
        expect(valid).toBe(true);
    });

    it('returns false when the password does not match the stored hash', () => {
        // Arrange
        const storedHash = hashPassword('voter1234');

        // Act
        const valid = verifyPassword('wrong-password', storedHash);

        // Assert
        expect(valid).toBe(false);
    });

    it('returns false instead of throwing for a malformed stored hash', () => {
        // Arrange
        const password = 'voter1234';
        const malformedHash = 'garbage';

        // Act
        const valid = verifyPassword(password, malformedHash);

        // Assert
        expect(valid).toBe(false);
    });
});