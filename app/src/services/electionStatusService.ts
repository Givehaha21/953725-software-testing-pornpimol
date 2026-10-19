import { NotFoundError } from '../errors';
import { DistrictRepository } from '../repositories/districtRepository';

export type ElectionState = 'OPEN' | 'CLOSED';

export interface DistrictElectionStatus {
    districtId: string;
    state: ElectionState;
    updatedAt: Date;
}

export interface DistrictElectionStatusRepository {
    findByDistrictId(districtId: string): Promise<DistrictElectionStatus | null>;
    findAll(): Promise<DistrictElectionStatus[]>;
    save(status: DistrictElectionStatus): Promise<void>;
}

export interface ElectionStatusClock {
    now(): Date;
}

export interface BulkStatusResult {
    changed: boolean;
    statuses: DistrictElectionStatus[];
}

export class ElectionStatusService {
    constructor(
        private readonly districts: DistrictRepository,
        private readonly statuses: DistrictElectionStatusRepository,
        private readonly clock: ElectionStatusClock,
    ) { }

    async openDistrict(districtId: string): Promise<DistrictElectionStatus> {
        return this.setDistrictState(districtId, 'OPEN');
    }

    async closeDistrict(districtId: string): Promise<DistrictElectionStatus> {
        return this.setDistrictState(districtId, 'CLOSED');
    }

    async openAll(confirmed: boolean): Promise<BulkStatusResult> {
        return this.setAllStates('OPEN', confirmed);
    }

    async closeAll(confirmed: boolean): Promise<BulkStatusResult> {
        return this.setAllStates('CLOSED', confirmed);
    }

    async canVote(districtId: string): Promise<boolean> {
        const status = await this.statuses.findByDistrictId(districtId);
        return status?.state === 'OPEN';
    }

    private async setDistrictState(districtId: string, state: ElectionState): Promise<DistrictElectionStatus> {
        const district = await this.districts.findById(districtId);
        if (!district) {
            throw new NotFoundError('district not found');
        }

        const current = await this.statuses.findByDistrictId(districtId);
        if (current?.state === state) {
            return current;
        }

        const next: DistrictElectionStatus = {
            districtId,
            state,
            updatedAt: this.clock.now(),
        };
        await this.statuses.save(next);
        return next;
    }

    private async setAllStates(state: ElectionState, confirmed: boolean): Promise<BulkStatusResult> {
        const current = await this.currentStatuses();

        if (!confirmed) {
            return { changed: false, statuses: current };
        }

        const now = this.clock.now();
        const next = current.map((status) =>
            status.state === state
                ? status
                : {
                    districtId: status.districtId,
                    state,
                    updatedAt: now,
                },
        );

        const changed = next.filter((status, index) => status !== current[index]);
        await Promise.all(changed.map((status) => this.statuses.save(status)));

        return { changed: changed.length > 0, statuses: next };
    }

    private async currentStatuses(): Promise<DistrictElectionStatus[]> {
        const [districts, savedStatuses] = await Promise.all([this.districts.findAll(), this.statuses.findAll()]);
        const savedByDistrictId = new Map(savedStatuses.map((status) => [status.districtId, status]));

        return districts.map(
            (district) =>
                savedByDistrictId.get(district.id) ?? {
                    districtId: district.id,
                    state: 'CLOSED',
                    updatedAt: this.clock.now(),
                },
        );
    }
}