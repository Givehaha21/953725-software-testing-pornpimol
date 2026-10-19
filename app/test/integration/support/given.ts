import { Pool } from 'pg';
import { JwtTokenService } from '../../../src/auth/tokenService';
import { Candidate, Party, User } from '../../../src/domain/types';
import { PgCandidateRepository } from '../../../src/repositories/candidateRepository';
import { PgPartyRepository } from '../../../src/repositories/partyRepository';
import { PgUserRepository } from '../../../src/repositories/userRepository';
import { CandidateSpec, PartySpec, UserSpec } from '../../support/builders';

export function given(pool: Pool) {
    const users = new PgUserRepository(pool);
    const parties = new PgPartyRepository(pool);
    const candidates = new PgCandidateRepository(pool);
    const tokens = new JwtTokenService('test-secret');

    return {
        async user(spec: UserSpec): Promise<User> {
            const created = await users.create({
                nationalId: spec.nationalId,
                passwordHash: spec.passwordHash,
                firstName: spec.firstName,
                lastName: spec.lastName,
                address: spec.address,
                districtId: spec.districtId,
            });

            if (spec.role === 'VOTER') return created;

            return (await users.updateRole(created.id, spec.role))!;
        },

        async party(spec: PartySpec): Promise<Party> {
            return parties.create(spec);
        },

        async candidate(spec: CandidateSpec): Promise<Candidate> {
            return candidates.create(spec);
        },

        authHeader(user: User): string {
            const token = tokens.issue({
                userId: user.id,
                role: user.role,
                districtId: user.districtId,
            });

            return `Bearer ${token}`;
        },
    };
}