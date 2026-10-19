import { ConflictError } from '../../src/errors';
import { ElectionAdminService } from '../../src/services/electionAdminService';
import {
    InMemoryCandidateRepository,
    InMemoryDistrictRepository,
    InMemoryPartyRepository,
} from '../support/inMemoryRepositories';

describe('ElectionAdminService.addCandidate', () => {
    it('adds a candidate to a district', async () => {
        // Arrange
        const partyData = [{ id: 1, name: 'พรรคตัวอย่าง', logoUrl: null, policy: 'นโยบายตัวอย่าง' }];
        const districts = new InMemoryDistrictRepository([{ id: 'CM-1', province: 'เชียงใหม่', number: 1 }]);
        const parties = new InMemoryPartyRepository(partyData);
        const candidates = new InMemoryCandidateRepository(partyData);
        const service = new ElectionAdminService(parties, candidates, districts);

        // Act
        const candidate = await service.addCandidate('CM-1', {
            partyId: 1,
            number: 1,
            firstName: 'สมชาย',
            lastName: 'ใจดี',
        });

        // Assert
        expect(candidate).toEqual({
            id: 1,
            districtId: 'CM-1',
            partyId: 1,
            partyName: 'พรรคตัวอย่าง',
            number: 1,
            firstName: 'สมชาย',
            lastName: 'ใจดี',
            photoUrl: null,
        });
    });

    it('rejects a candidate number already used in the district', async () => {
        // Arrange — Fake มีผู้สมัครหมายเลข 1 อยู่ในเขต CM-1 แล้ว
        const partyData = [
            { id: 1, name: 'พรรคตัวอย่าง', logoUrl: null, policy: 'นโยบายตัวอย่าง' },
            { id: 2, name: 'พรรคใหม่', logoUrl: null, policy: 'นโยบายใหม่' },
        ];
        const districts = new InMemoryDistrictRepository([{ id: 'CM-1', province: 'เชียงใหม่', number: 1 }]);
        const parties = new InMemoryPartyRepository(partyData);
        const candidates = new InMemoryCandidateRepository(partyData, [
            {
                id: 1,
                districtId: 'CM-1',
                partyId: 1,
                partyName: 'พรรคตัวอย่าง',
                number: 1,
                firstName: 'ผู้สมัครเดิม',
                lastName: 'ใจดี',
                photoUrl: null,
            },
        ]);
        const service = new ElectionAdminService(parties, candidates, districts);

        // Act — พรรคอื่นพยายามใช้หมายเลข 1 ซ้ำในเขตเดิม
        const result = service.addCandidate('CM-1', {
            partyId: 2,
            number: 1,
            firstName: 'ผู้สมัครใหม่',
            lastName: 'สุขใจ',
        });

        // Assert
        await expect(result).rejects.toThrow(ConflictError);
    });
});