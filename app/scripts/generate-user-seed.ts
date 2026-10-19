import { writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { faker, fakerTH } from '@faker-js/faker';
import { hashPassword } from '../src/auth/passwords';
import { Role } from '../src/domain/types';
import { DEFAULT_PASSWORD, UserBuilder, UserSpec } from '../test/support/builders';

const roles: Role[] = ['VOTER', 'COMMISSIONER', 'ADMIN'];

function escapeSql(value: string): string {
    return value.replaceAll("'", "''");
}

function main(): void {
    const { values } = parseArgs({
        options: {
            role: { type: 'string', default: 'COMMISSIONER' },
            count: { type: 'string', default: '3' },
            district: { type: 'string', default: 'CM-1' },
            password: { type: 'string', default: DEFAULT_PASSWORD },
            seed: { type: 'string', default: '20261003' },
            context: { type: 'string', default: 'dev' },
            id: { type: 'string', default: '902-seed-commissioners' },
            out: { type: 'string', default: 'db/changelog/changes/902-seed-commissioners.sql' },
        },
        strict: true,
    });

    const role = values.role as Role;
    const count = Number(values.count);
    const districtId = values.district!;
    const password = values.password!;
    const seed = Number(values.seed);
    const context = values.context!;
    const changesetId = values.id!;
    const outputPath = values.out!;

    if (!roles.includes(role)) {
        throw new Error(`role ต้องเป็นหนึ่งใน: ${roles.join(', ')}`);
    }
    if (!Number.isInteger(count) || count <= 0) {
        throw new Error('count ต้องเป็นจำนวนเต็มที่มากกว่า 0');
    }
    if (!Number.isInteger(seed)) {
        throw new Error('seed ต้องเป็นจำนวนเต็ม');
    }
    if (!['dev', 'e2e'].includes(context)) {
        throw new Error('context ต้องเป็น dev หรือ e2e');
    }

    faker.seed(seed);
    fakerTH.seed(seed);

    const passwordHash = hashPassword(password);
    const nationalIds = new Set<string>();
    const users: UserSpec[] = [];

    while (users.length < count) {
        const user = new UserBuilder(role).inDistrict(districtId).build();
        if (nationalIds.has(user.nationalId)) continue;

        nationalIds.add(user.nationalId);
        users.push({ ...user, passwordHash });
    }

    const rows = users
        .map(
            (user) =>
                `  ('${escapeSql(user.nationalId)}', '${escapeSql(user.passwordHash)}', ` +
                `'${escapeSql(user.firstName)}', '${escapeSql(user.lastName)}', ` +
                `'${escapeSql(user.address)}', '${escapeSql(user.districtId)}', '${user.role}')`,
        )
        .join(',\n');

    const ids = users.map((user) => `'${escapeSql(user.nationalId)}'`).join(', ');

    const sql = `--liquibase formatted sql

-- Generated with: npx tsx scripts/generate-user-seed.ts
-- Password for every generated account: ${password}

--changeset election:${changesetId} context:${context}
INSERT INTO users (national_id, password_hash, first_name, last_name, address, district_id, role) VALUES
${rows};
--rollback DELETE FROM users WHERE national_id IN (${ids});
`;

    writeFileSync(outputPath, sql, 'utf8');
    console.log(`Generated ${users.length} ${role} account(s): ${outputPath}`);
}

main();