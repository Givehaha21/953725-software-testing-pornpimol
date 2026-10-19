import { isValidThaiNationalId } from '../../src/domain/thaiNationalId';
import {
    aCandidate,
    aCommissioner,
    aParty,
    aVoter,
    DEFAULT_PASSWORD,
} from '../support/builders';

describe('Test Data Builders', () => {
    it('builds a voter with a valid dynamically generated Thai national ID', () => {
        // Arrange / Act
        const voter = aVoter().inDistrict('CM-2').build();

        // Assert
        expect(isValidThaiNationalId(voter.nationalId)).toBe(true);
        expect(voter.districtId).toBe('CM-2');
        expect(voter.role).toBe('VOTER');
        expect(voter.firstName).not.toBe('');
        expect(voter.lastName).not.toBe('');
        expect(DEFAULT_PASSWORD).toBe('admin1234');
    });

    it('allows a commissioner to override the national ID and district', () => {
        // Arrange / Act
        const commissioner = aCommissioner()
            .withNationalId('1100000000024')
            .inDistrict('CM-1')
            .build();

        // Assert
        expect(commissioner).toMatchObject({
            nationalId: '1100000000024',
            districtId: 'CM-1',
            role: 'COMMISSIONER',
        });
    });

    it('builds party and candidate data with requested values', () => {
        // Arrange / Act
        const party = aParty().named('พรรคทดสอบ').build();
        const candidate = aCandidate().inDistrict('CM-2').forParty(5).numbered(7).build();

        // Assert
        expect(party.name).toBe('พรรคทดสอบ');
        expect(candidate).toMatchObject({
            districtId: 'CM-2',
            partyId: 5,
            number: 7,
        });
    });
});