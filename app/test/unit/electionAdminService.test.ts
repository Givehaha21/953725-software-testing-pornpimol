import { ConflictError, ValidationError } from '../../src/errors';
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
    it('rejects a second candidate from the same party in the district', async () => {
        // Arrange — พรรคตัวอย่างมีผู้สมัครในเขต CM-1 อยู่แล้ว
        const partyData = [{ id: 1, name: 'พรรคตัวอย่าง', logoUrl: null, policy: 'นโยบายตัวอย่าง' }];
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

        // Act — พรรคเดิมพยายามส่งผู้สมัครคนที่สอง แม้ใช้หมายเลขอื่น
        const result = service.addCandidate('CM-1', {
            partyId: 1,
            number: 2,
            firstName: 'ผู้สมัครคนที่สอง',
            lastName: 'สุขใจ',
        });

        // Assert
        await expect(result).rejects.toThrow(ConflictError);
    });
    it('allows the same number in a different district', async () => {
        // Arrange — เขต CM-1 มีหมายเลข 1 แล้ว แต่ CM-2 ยังไม่มี
        const partyData = [
            { id: 1, name: 'พรรคตัวอย่าง', logoUrl: null, policy: 'นโยบายตัวอย่าง' },
            { id: 2, name: 'พรรคใหม่', logoUrl: null, policy: 'นโยบายใหม่' },
        ];
        const districts = new InMemoryDistrictRepository([
            { id: 'CM-1', province: 'เชียงใหม่', number: 1 },
            { id: 'CM-2', province: 'เชียงใหม่', number: 2 },
        ]);
        const parties = new InMemoryPartyRepository(partyData);
        const candidates = new InMemoryCandidateRepository(partyData, [
            {
                id: 1,
                districtId: 'CM-1',
                partyId: 1,
                partyName: 'พรรคตัวอย่าง',
                number: 1,
                firstName: 'ผู้สมัครเขตหนึ่ง',
                lastName: 'ใจดี',
                photoUrl: null,
            },
        ]);
        const service = new ElectionAdminService(parties, candidates, districts);

        // Act
        const candidate = await service.addCandidate('CM-2', {
            partyId: 2,
            number: 1,
            firstName: 'ผู้สมัครเขตสอง',
            lastName: 'สุขใจ',
        });

        // Assert
        expect(candidate).toMatchObject({
            districtId: 'CM-2',
            partyId: 2,
            number: 1,
            partyName: 'พรรคใหม่',
        });
    });
    it('rejects an unknown party', async () => {
        // Arrange — เขตมีอยู่จริง แต่ไม่มีพรรค id 99
        const partyData = [{ id: 1, name: 'พรรคตัวอย่าง', logoUrl: null, policy: 'นโยบายตัวอย่าง' }];
        const districts = new InMemoryDistrictRepository([{ id: 'CM-1', province: 'เชียงใหม่', number: 1 }]);
        const parties = new InMemoryPartyRepository(partyData);
        const candidates = new InMemoryCandidateRepository(partyData);
        const service = new ElectionAdminService(parties, candidates, districts);

        // Act
        const result = service.addCandidate('CM-1', {
            partyId: 99,
            number: 1,
            firstName: 'ผู้สมัคร',
            lastName: 'ไม่พบพรรค',
        });

        // Assert
        await expect(result).rejects.toThrow(ValidationError);
    });
});