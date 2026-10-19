import { Pool } from 'pg';
import request from 'supertest';
import { createApp, pgDeps } from '../../src/app';
import { JwtTokenService } from '../../src/auth/tokenService';
import { aCandidate, aCommissioner, aParty, aVoter, anAdmin } from '../support/builders';
import { createTestPool, truncateAll } from './support/database';
import { given } from './support/given';

describe('election management (component)', () => {
    let pool: Pool;
    let app: ReturnType<typeof createApp>;

    beforeAll(() => {
        pool = createTestPool();
        app = createApp(pgDeps(pool, new JwtTokenService('test-secret')));
    });

    beforeEach(async () => {
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

        it('forbids a voter from creating a party', async () => {
            // Arrange
            const data = given(pool);
            const voter = await data.user(aVoter().inDistrict('CM-1').build());
            const party = aParty().named('พรรคที่ Voter สร้างไม่ได้').build();

            // Act
            const response = await request(app)
                .post('/parties')
                .set('Authorization', data.authHeader(voter))
                .send(party);

            // Assert
            expect(response.status).toBe(403);
        });

        it('requires a token to create a party', async () => {
            // Arrange
            const party = aParty().named('พรรคไม่มี Token').build();

            // Act
            const response = await request(app).post('/parties').send(party);

            // Assert
            expect(response.status).toBe(401);
        });

        it('rejects a duplicate party name', async () => {
            // Arrange
            const data = given(pool);
            const commissioner = await data.user(aCommissioner().inDistrict('CM-1').build());
            const existingParty = aParty().named('พรรคชื่อซ้ำ').build();
            await data.party(existingParty);

            // Act
            const response = await request(app)
                .post('/parties')
                .set('Authorization', data.authHeader(commissioner))
                .send(aParty().named('พรรคชื่อซ้ำ').build());

            // Assert
            expect(response.status).toBe(409);
        });
    });

    describe('POST /districts/:id/candidates', () => {
        it('adds a candidate that then appears in the public results of that district', async () => {
            // Arrange
            const data = given(pool);
            const commissioner = await data.user(aCommissioner().inDistrict('CM-1').build());
            const party = await data.party(aParty().named('พรรคผู้สมัคร').build());
            const candidateInput = aCandidate().inDistrict('CM-1').forParty(party.id).numbered(1).build();

            // Act
            const created = await request(app)
                .post('/districts/CM-1/candidates')
                .set('Authorization', data.authHeader(commissioner))
                .send(candidateInput);
            const results = await request(app).get('/districts/CM-1/results');

            // Assert
            expect(created.status).toBe(201);
            expect(results.status).toBe(200);
            expect(results.body).toMatchObject({
                district: { id: 'CM-1' },
                closed: false,
            });
            expect(results.body.candidates).toContainEqual({
                number: 1,
                firstName: candidateInput.firstName,
                lastName: candidateInput.lastName,
                partyName: 'พรรคผู้สมัคร',
            });
        });
    });

    describe('PATCH /admin/users/:id/role', () => {
        it('lets an admin promote a voter to commissioner', async () => {
            // Arrange
            const data = given(pool);
            const admin = await data.user(anAdmin().inDistrict('CM-1').build());
            const voter = await data.user(aVoter().inDistrict('CM-1').build());

            // Act
            const response = await request(app)
                .patch(`/admin/users/${voter.id}/role`)
                .set('Authorization', data.authHeader(admin))
                .send({ role: 'COMMISSIONER' });

            // Assert
            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                id: voter.id,
                role: 'COMMISSIONER',
            });
            expect(response.body).not.toHaveProperty('passwordHash');
        });
    });
});