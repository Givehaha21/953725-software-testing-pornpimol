import { Candidate, District, Party } from '../../src/domain/types';
import { NewCandidate, CandidateRepository } from '../../src/repositories/candidateRepository';
import { DistrictRepository } from '../../src/repositories/districtRepository';
import { NewParty, PartyRepository } from '../../src/repositories/partyRepository';

export class InMemoryDistrictRepository implements DistrictRepository {
    constructor(private readonly districts: District[] = []) { }

    async findAll(): Promise<District[]> {
        return [...this.districts].sort(
            (left, right) => left.province.localeCompare(right.province) || left.number - right.number,
        );
    }

    async findById(id: string): Promise<District | null> {
        return this.districts.find((district) => district.id === id) ?? null;
    }
}

export class InMemoryPartyRepository implements PartyRepository {
    constructor(private readonly parties: Party[] = []) { }

    async findAll(): Promise<Party[]> {
        return [...this.parties].sort((left, right) => left.name.localeCompare(right.name));
    }

    async findById(id: number): Promise<Party | null> {
        return this.parties.find((party) => party.id === id) ?? null;
    }

    async findByName(name: string): Promise<Party | null> {
        return this.parties.find((party) => party.name === name) ?? null;
    }

    async create(newParty: NewParty): Promise<Party> {
        const nextId = Math.max(0, ...this.parties.map((party) => party.id)) + 1;
        const party: Party = { id: nextId, ...newParty };
        this.parties.push(party);
        return party;
    }
}

export class InMemoryCandidateRepository implements CandidateRepository {
    constructor(
        private readonly parties: Party[],
        private readonly candidates: Candidate[] = [],
    ) { }

    async findByDistrict(districtId: string): Promise<Candidate[]> {
        return this.candidates
            .filter((candidate) => candidate.districtId === districtId)
            .sort((left, right) => left.number - right.number);
    }

    async findByParty(partyId: number): Promise<Candidate[]> {
        return this.candidates
            .filter((candidate) => candidate.partyId === partyId)
            .sort((left, right) => left.districtId.localeCompare(right.districtId) || left.number - right.number);
    }

    async create(newCandidate: NewCandidate): Promise<Candidate> {
        const party = this.parties.find((item) => item.id === newCandidate.partyId);
        if (!party) throw new Error('party not found');

        const nextId = Math.max(0, ...this.candidates.map((candidate) => candidate.id)) + 1;
        const candidate: Candidate = {
            id: nextId,
            ...newCandidate,
            partyName: party.name,
        };
        this.candidates.push(candidate);
        return candidate;
    }
}