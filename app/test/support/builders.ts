import { fakerTH } from '@faker-js/faker';
import { Role } from '../../src/domain/types';

export const DEFAULT_PASSWORD = 'admin1234';

// เป็น hash ที่คำนวณไว้แล้วของ DEFAULT_PASSWORD
// Builder จึงไม่ต้องเรียก scrypt ทุกครั้งที่สร้าง test data
const DEFAULT_PASSWORD_HASH =
    'scrypt$2503403b22ecb04d7a2536b9d0a70eb8$49febd6d5c2c60f7409169d8deb5bcae33abb64ba19cc5df8dc6d6137102958a60e830128624a5bbb84dfcc910eda3b90d1c52872e6ad9966626fb29acef6839';

export type UserSpec = {
    nationalId: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    address: string;
    districtId: string;
    role: Role;
};

export type PartySpec = {
    name: string;
    logoUrl: string | null;
    policy: string;
};

export type CandidateSpec = {
    districtId: string;
    partyId: number;
    number: number;
    firstName: string;
    lastName: string;
    photoUrl: string | null;
};

function createValidThaiNationalId(): string {
    const firstTwelveDigits = [
        fakerTH.number.int({ min: 1, max: 9 }),
        ...Array.from({ length: 11 }, () => fakerTH.number.int({ min: 0, max: 9 })),
    ].join('');

    const sum = [...firstTwelveDigits].reduce(
        (total, digit, index) => total + Number(digit) * (13 - index),
        0,
    );
    const checksum = (11 - (sum % 11)) % 10;

    return `${firstTwelveDigits}${checksum}`;
}

export class UserBuilder {
    private districtId = 'CM-1';
    private nationalId = createValidThaiNationalId();

    constructor(private readonly role: Role) { }

    inDistrict(districtId: string): this {
        this.districtId = districtId;
        return this;
    }

    withNationalId(nationalId: string): this {
        this.nationalId = nationalId;
        return this;
    }

    build(): UserSpec {
        return {
            nationalId: this.nationalId,
            passwordHash: DEFAULT_PASSWORD_HASH,
            firstName: fakerTH.person.firstName(),
            lastName: fakerTH.person.lastName(),
            address: `${fakerTH.location.streetAddress()}, ${fakerTH.location.city()}`,
            districtId: this.districtId,
            role: this.role,
        };
    }
}

export class PartyBuilder {
    private name = `พรรค${fakerTH.word.noun()}`;

    named(name: string): this {
        this.name = name;
        return this;
    }

    build(): PartySpec {
        return {
            name: this.name,
            logoUrl: null,
            policy: fakerTH.lorem.sentence(),
        };
    }
}

export class CandidateBuilder {
    private districtId = 'CM-1';
    private partyId = 1;
    private number = 1;

    inDistrict(districtId: string): this {
        this.districtId = districtId;
        return this;
    }

    forParty(partyId: number): this {
        this.partyId = partyId;
        return this;
    }

    numbered(number: number): this {
        this.number = number;
        return this;
    }

    build(): CandidateSpec {
        return {
            districtId: this.districtId,
            partyId: this.partyId,
            number: this.number,
            firstName: fakerTH.person.firstName(),
            lastName: fakerTH.person.lastName(),
            photoUrl: null,
        };
    }
}

export const aVoter = (): UserBuilder => new UserBuilder('VOTER');
export const aCommissioner = (): UserBuilder => new UserBuilder('COMMISSIONER');
export const anAdmin = (): UserBuilder => new UserBuilder('ADMIN');
export const aParty = (): PartyBuilder => new PartyBuilder();
export const aCandidate = (): CandidateBuilder => new CandidateBuilder();