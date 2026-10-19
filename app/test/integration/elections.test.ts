import request from 'supertest';
import { Pool } from 'pg';
import { createApp, pgDeps } from '../../src/app';
import { JwtTokenService } from '../../src/auth/tokenService';
import { aCommissioner, aParty } from '../support/builders';
import { given } from './support/given';
import { createTestPool, truncateAll } from './support/database';

describe('election management (component)', () => {
    let pool: Pool;
    let app: ReturnType<typeof createApp>;

    beforeAll(() => {
        pool = createTestPool();
        app = createApp(pgDeps(pool, new JwtTokenService('test-secret')));
    });

    beforeEach(async () => {
        // Fresh Fixture: ทุก test เริ่มจากข้อมูลว่าง
        await truncateAll(pool);
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('POST /parties', () => {
        it('lets a commissioner create a party', async () => {
            // Arrange
            const data = given(pool);
            const commissioner = await data.user(aCommissioner().inDistrict('CM-1').build());
            const party = aParty().named('พรรคทดสอบ').build();

            // Act
            const response = await request(app)
                .post('/parties')
                .set('Authorization', data.authHeader(commissioner))
                .send(party);

            // Assert
            expect(response.status).toBe(201);
            expect(response.body).toMatchObject({
                name: 'พรรคทดสอบ',
                policy: party.policy,
                logoUrl: null,
            });
            expect(response.body.id).toEqual(expect.any(Number));
        });
    });
});