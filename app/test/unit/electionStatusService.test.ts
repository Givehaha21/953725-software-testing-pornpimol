import { faker } from '@faker-js/faker';
import { District } from '../../src/domain/types';
import { NotFoundError } from '../../src/errors';
import {
    DistrictElectionStatus,
    DistrictElectionStatusRepository,
    ElectionStatusClock,
    ElectionStatusService,
} from '../../src/services/electionStatusService';
import { DistrictRepository } from '../../src/repositories/districtRepository';

const fixedNow = new Date('2026-10-19T09:30:00.000Z');

function aDistrict(id: string): District {
    return { id, province: 'เชียงใหม่', number: 1 };
}

class StubDistrictRepository implements DistrictRepository {
    constructor(private readonly districts: District[]) { }

    async findAll(): Promise<District[]> {
        return this.districts;
    }

    async findById(id: string): Promise<District | null> {
        return this.districts.find((district) => district.id === id) ?? null;
    }
}

class InMemoryStatusRepository implements DistrictElectionStatusRepository {
    private readonly statuses = new Map<string, DistrictElectionStatus>();

    constructor(initial: DistrictElectionStatus[] = []) {
        for (const status of initial) {
            this.statuses.set(status.districtId, status);
        }
    }

    async findByDistrictId(districtId: string): Promise<DistrictElectionStatus | null> {
        return this.statuses.get(districtId) ?? null;
    }

    async findAll(): Promise<DistrictElectionStatus[]> {
        return [...this.statuses.values()];
    }

    async save(status: DistrictElectionStatus): Promise<void> {
        this.statuses.set(status.districtId, status);
    }
}

class SpyStatusRepository implements DistrictElectionStatusRepository {
    private readonly statuses = new Map<string, DistrictElectionStatus>();

    readonly save = jest.fn(async (status: DistrictElectionStatus): Promise<void> => {
        this.statuses.set(status.districtId, status);
    });

    constructor(initial: DistrictElectionStatus[] = []) {
        for (const status of initial) {
            this.statuses.set(status.districtId, status);
        }
    }

    async findByDistrictId(districtId: string): Promise<DistrictElectionStatus | null> {
        return this.statuses.get(districtId) ?? null;
    }

    async findAll(): Promise<DistrictElectionStatus[]> {
        return [...this.statuses.values()];
    }
}

const fixedClock: ElectionStatusClock = {
    now: () => fixedNow,
};

describe('ElectionStatusService', () => {
    it('TC-ECT-F03-07: opens a closed district and records the time', async () => {
        // Stub + Spy
        const districts = new StubDistrictRepository([aDistrict('CM-1')]);
        const statuses = new SpyStatusRepository([
            { districtId: 'CM-1', state: 'CLOSED', updatedAt: new Date('2026-10-19T08:00:00.000Z') },
        ]);
        const service = new ElectionStatusService(districts, statuses, fixedClock);

        const result = await service.openDistrict('CM-1');

        expect(result).toEqual({ districtId: 'CM-1', state: 'OPEN', updatedAt: fixedNow });
        expect(statuses.save).toHaveBeenCalledTimes(1);
        expect(statuses.save).toHaveBeenCalledWith({
            districtId: 'CM-1',
            state: 'OPEN',
            updatedAt: fixedNow,
        });
    });

    it('TC-ECT-F03-08: closes an open district', async () => {
        const districts = new StubDistrictRepository([aDistrict('CM-1')]);
        const statuses = new InMemoryStatusRepository([
            { districtId: 'CM-1', state: 'OPEN', updatedAt: new Date('2026-10-19T08:00:00.000Z') },
        ]);
        const service = new ElectionStatusService(districts, statuses, fixedClock);

        const result = await service.closeDistrict('CM-1');

        expect(result).toEqual({ districtId: 'CM-1', state: 'CLOSED', updatedAt: fixedNow });
    });

    it('has an alternative path: rejects an unknown district', async () => {
        const service = new ElectionStatusService(
            new StubDistrictRepository([]),
            new InMemoryStatusRepository(),
            fixedClock,
        );

        await expect(service.openDistrict('UNKNOWN')).rejects.toThrow(NotFoundError);
    });

    it('TC-ECT-F03-09: opens every district after confirmation', async () => {
        // Mock verifies the interaction with the status repository.
        const districts = new StubDistrictRepository([aDistrict('CM-1'), aDistrict('CM-2')]);
        const save = jest.fn<Promise<void>, [DistrictElectionStatus]>().mockResolvedValue();
        const statuses: DistrictElectionStatusRepository = {
            findByDistrictId: jest.fn(),
            findAll: jest.fn().mockResolvedValue([
                { districtId: 'CM-1', state: 'CLOSED', updatedAt: fixedNow },
                { districtId: 'CM-2', state: 'CLOSED', updatedAt: fixedNow },
            ]),
            save,
        };
        const service = new ElectionStatusService(districts, statuses, fixedClock);

        const result = await service.openAll(true);

        expect(result.changed).toBe(true);
        expect(result.statuses).toEqual([
            { districtId: 'CM-1', state: 'OPEN', updatedAt: fixedNow },
            { districtId: 'CM-2', state: 'OPEN', updatedAt: fixedNow },
        ]);
        expect(save).toHaveBeenCalledTimes(2);
    });

    it('TC-ECT-F03-10: keeps every status unchanged when opening all is cancelled', async () => {
        const districts = new StubDistrictRepository([aDistrict('CM-1')]);
        const save = jest.fn<Promise<void>, [DistrictElectionStatus]>().mockResolvedValue();
        const initial = { districtId: 'CM-1', state: 'CLOSED' as const, updatedAt: fixedNow };
        const statuses: DistrictElectionStatusRepository = {
            findByDistrictId: jest.fn(),
            findAll: jest.fn().mockResolvedValue([initial]),
            save,
        };
        const service = new ElectionStatusService(districts, statuses, fixedClock);

        const result = await service.openAll(false);

        expect(result).toEqual({ changed: false, statuses: [initial] });
        expect(save).not.toHaveBeenCalled();
    });

    it('TC-ECT-F03-11: opening every district again is idempotent', async () => {
        const districts = new StubDistrictRepository([aDistrict('CM-1')]);
        const save = jest.fn<Promise<void>, [DistrictElectionStatus]>().mockResolvedValue();
        const openStatus = { districtId: 'CM-1', state: 'OPEN' as const, updatedAt: fixedNow };
        const statuses: DistrictElectionStatusRepository = {
            findByDistrictId: jest.fn(),
            findAll: jest.fn().mockResolvedValue([openStatus]),
            save,
        };
        const service = new ElectionStatusService(districts, statuses, fixedClock);

        const result = await service.openAll(true);

        expect(result).toEqual({ changed: false, statuses: [openStatus] });
        expect(save).not.toHaveBeenCalled();
    });

    it('TC-ECT-F03-12: closes every district after confirmation', async () => {
        const districts = new StubDistrictRepository([aDistrict('CM-1'), aDistrict('CM-2')]);
        const save = jest.fn<Promise<void>, [DistrictElectionStatus]>().mockResolvedValue();
        const statuses: DistrictElectionStatusRepository = {
            findByDistrictId: jest.fn(),
            findAll: jest.fn().mockResolvedValue([
                { districtId: 'CM-1', state: 'OPEN', updatedAt: fixedNow },
                { districtId: 'CM-2', state: 'OPEN', updatedAt: fixedNow },
            ]),
            save,
        };
        const service = new ElectionStatusService(districts, statuses, fixedClock);

        const result = await service.closeAll(true);

        expect(result.changed).toBe(true);
        expect(result.statuses).toEqual([
            { districtId: 'CM-1', state: 'CLOSED', updatedAt: fixedNow },
            { districtId: 'CM-2', state: 'CLOSED', updatedAt: fixedNow },
        ]);
        expect(save).toHaveBeenCalledTimes(2);
    });

    it('TC-ECT-F03-13: keeps every status unchanged when closing all is cancelled', async () => {
        const districts = new StubDistrictRepository([aDistrict('CM-1')]);
        const save = jest.fn<Promise<void>, [DistrictElectionStatus]>().mockResolvedValue();
        const initial = { districtId: 'CM-1', state: 'OPEN' as const, updatedAt: fixedNow };
        const statuses: DistrictElectionStatusRepository = {
            findByDistrictId: jest.fn(),
            findAll: jest.fn().mockResolvedValue([initial]),
            save,
        };
        const service = new ElectionStatusService(districts, statuses, fixedClock);

        const result = await service.closeAll(false);

        expect(result).toEqual({ changed: false, statuses: [initial] });
        expect(save).not.toHaveBeenCalled();
    });

    it('TC-ECT-F03-14: closing every district again is idempotent', async () => {
        const districts = new StubDistrictRepository([aDistrict('CM-1')]);
        const save = jest.fn<Promise<void>, [DistrictElectionStatus]>().mockResolvedValue();
        const closedStatus = { districtId: 'CM-1', state: 'CLOSED' as const, updatedAt: fixedNow };
        const statuses: DistrictElectionStatusRepository = {
            findByDistrictId: jest.fn(),
            findAll: jest.fn().mockResolvedValue([closedStatus]),
            save,
        };
        const service = new ElectionStatusService(districts, statuses, fixedClock);

        const result = await service.closeAll(true);

        expect(result).toEqual({ changed: false, statuses: [closedStatus] });
        expect(save).not.toHaveBeenCalled();
    });
    it('TC-ECT-F03-15 and TC-ECT-F03-16: allows voting only while the district is open', async () => {
        const districts = new StubDistrictRepository([aDistrict('CM-1'), aDistrict('CM-2')]);
        const statuses = new InMemoryStatusRepository([
            { districtId: 'CM-1', state: 'OPEN', updatedAt: fixedNow },
            { districtId: 'CM-2', state: 'CLOSED', updatedAt: fixedNow },
        ]);
        const service = new ElectionStatusService(districts, statuses, fixedClock);

        await expect(service.canVote('CM-1')).resolves.toBe(true);
        await expect(service.canVote('CM-2')).resolves.toBe(false);
    });

    it('uses Faker-generated district data without sharing state between tests', async () => {
        const districtId = `TEST-${faker.string.alphanumeric({ length: 8, casing: 'upper' })}`;
        const districts = new StubDistrictRepository([aDistrict(districtId)]);
        const statuses = new InMemoryStatusRepository();
        const service = new ElectionStatusService(districts, statuses, fixedClock);

        const result = await service.openDistrict(districtId);

        expect(result).toMatchObject({ districtId, state: 'OPEN' });
    });
});