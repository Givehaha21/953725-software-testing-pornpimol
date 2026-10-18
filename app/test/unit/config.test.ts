import { loadConfig } from '../../src/config';

describe('loadConfig', () => {
    it('uses default values when no environment variables are provided', () => {
        // Arrange
        const env = {};

        // Act
        const config = loadConfig(env);

        // Assert
        expect(config).toEqual({
            port: 3000,
            databaseUrl: 'postgres://election:election@localhost:5432/election_dev',
            jwtSecret: 'dev-secret',
        });
    });

    it('reads port, database URL, and JWT secret from the provided environment', () => {
        // Arrange
        const env = {
            PORT: '8080',
            DATABASE_URL: 'postgres://test:test@localhost:5433/election_test',
            JWT_SECRET: 'test-secret',
        };

        // Act
        const config = loadConfig(env);

        // Assert
        expect(config).toEqual({
            port: 8080,
            databaseUrl: 'postgres://test:test@localhost:5433/election_test',
            jwtSecret: 'test-secret',
        });
    });
});