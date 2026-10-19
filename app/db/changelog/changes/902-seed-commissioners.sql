--liquibase formatted sql

-- Generated with: npx tsx scripts/generate-user-seed.ts
-- Password for every generated account: admin1234

--changeset election:902-seed-commissioners context:dev
INSERT INTO users (national_id, password_hash, first_name, last_name, address, district_id, role) VALUES
  ('7888165997564', 'scrypt$1fddf6ad6c0ee31319e56e8529f7a077$9a010d0aab8eb1c0bfa2ff8d8dbe1d7076c0fd9726324a0bd7b04136c0689ea44aa2d9c07e6ed89a1e71ad40d763c197830392af636cd7ea59dcb8b1548eea98', 'อรณิชา', 'เกตุพิมาย', '2 ข้าวหลาม, อุดรธานี', 'CM-1', 'COMMISSIONER'),
  ('4626081674387', 'scrypt$1fddf6ad6c0ee31319e56e8529f7a077$9a010d0aab8eb1c0bfa2ff8d8dbe1d7076c0fd9726324a0bd7b04136c0689ea44aa2d9c07e6ed89a1e71ad40d763c197830392af636cd7ea59dcb8b1548eea98', 'ภาณุวัชร', 'หิรัญ', '8 นครปฐม, นครศรีธรรมราช', 'CM-1', 'COMMISSIONER'),
  ('6650657875418', 'scrypt$1fddf6ad6c0ee31319e56e8529f7a077$9a010d0aab8eb1c0bfa2ff8d8dbe1d7076c0fd9726324a0bd7b04136c0689ea44aa2d9c07e6ed89a1e71ad40d763c197830392af636cd7ea59dcb8b1548eea98', 'สุธีมนต์', 'อิศรางกูร', '9500 จรัสเมือง, พัทยา', 'CM-1', 'COMMISSIONER');
--rollback DELETE FROM users WHERE national_id IN ('7888165997564', '4626081674387', '6650657875418');
