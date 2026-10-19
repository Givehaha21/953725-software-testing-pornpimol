# Workshop Log — Pornpimol

เอกสารนี้ใช้บันทึกการทำ Workshop **Software Testing in Real Industry** และอธิบายแนวคิดการทดสอบที่ใช้ในแต่ละ branch ของ repository

## Branch Overview

| Branch | หัวข้อ | สถานะ |
| --- | --- | --- |
| `pornpimol/lab/00-setup` | ตรวจความพร้อมและทดลองรัน Automated Tests | เสร็จแล้ว |
| `pornpimol/lab/01-boundaries` | Boundary Test Cases | เสร็จแล้ว |
| `pornpimol/lab/02-aaa-unit` | Arrange–Act–Assert และ Unit Test | ยังไม่เริ่ม |
| `pornpimol/lab/03-test-doubles` | Dummy, Stub, Spy, Mock และ Fake | ยังไม่เริ่ม |
| `pornpimol/lab/04-test-data` | Test Data, Database Isolation, Builder และ Faker | ยังไม่เริ่ม |
| `pornpimol/lab/05-ci` | Continuous Integration | ยังไม่เริ่ม |
| `pornpimol/lab/06-outside-in` | Acceptance Test, Component Test และ Unit Test | ยังไม่เริ่ม |
| `pornpimol/lab/07-legacy` | Characterization Test และการทดสอบ Legacy Code | ยังไม่เริ่ม |
| `pornpimol/lab/08-own-project` | ประยุกต์ใช้กับ Election App ของตนเอง | ยังไม่เริ่ม |

## Lab 00 — Setup

### สิ่งที่ทำ
- ตรวจสภาพแวดล้อมด้วย `npm run doctor` และผ่านครบ 9/9 checks
- รัน Unit Test ผ่าน 6 test cases
- รัน Integration Test ผ่าน 1 test case โดยเชื่อมต่อ PostgreSQL จริง
- รัน E2E Test ผ่าน 1 scenario ตั้งแต่สมัครสมาชิก เข้าสู่ระบบ และดูผู้สมัครในเขตเลือกตั้ง

### แนวคิดที่ได้เรียนรู้
- Unit Test ทดสอบฟังก์ชันย่อยแบบแยกส่วน จึงรันเร็วและระบุจุดผิดพลาดได้ชัด
- Integration Test ตรวจการทำงานร่วมกันของแอปและฐานข้อมูล
- E2E Test ตรวจเส้นทางการใช้งานจริงของระบบตั้งแต่ต้นจนจบ
- ได้ทดลองแก้สูตร checksum ให้ผิดเพื่อสังเกตว่า Unit Test แจ้งพฤติกรรมที่ผิดอย่างไร แล้วแก้กลับจนผ่านครบ

---

## Lab 01 — Boundary Test Cases

**Branch:** `pornpimol/lab/01-boundaries`

### สิ่งที่ทำ
- เพิ่มและปรับชื่อ Unit Test ของ `isValidThaiNationalId` เพื่อให้กรณีรอบขอบเขตความยาว 13 หลักชัดเจน
- ทดสอบ 12 หลัก (น้อยกว่าข้อกำหนด 1 หลัก), 13 หลัก (ความยาวถูกต้องและ checksum ถูกต้อง), และ 14 หลัก (มากกว่าข้อกำหนด 1 หลัก)
- คง test สำหรับ checksum ผิดและมีตัวอักษรปน เพื่อแยกความผิดพลาดด้านเนื้อหาจากความผิดพลาดด้านความยาว

### แนวคิดที่ได้เรียนรู้
- **Boundary Value Analysis (BVA)** เลือกทดสอบค่าที่จุดขอบของกฎ เพราะข้อผิดพลาดมักเกิดจากเงื่อนไขเปรียบเทียบหรือการกำหนดจำนวนที่คลาดเคลื่อน
- กฎของฟังก์ชันนี้คือ “ต้องมี 13 หลัก” จึงเลือก 12, 13 และ 14 หลักเป็นชุดทดสอบหลัก

### ผลที่คาดหวัง
- เมื่อรัน `npm run test:unit` ทุก test ต้องผ่าน
- หาก validation ถูกแก้ให้ยอมรับหรือปฏิเสธจำนวนหลักผิด Boundary Test จะล้มเหลวเพื่อแจ้งปัญหา

### ผลการรัน
- รัน `npm run test:unit` แล้วผ่าน 6/6 test cases


---

## Lab 02 — Arrange–Act–Assert และ Unit Test

**Branch:** `pornpimol/lab/02-aaa-unit`

### สิ่งที่ทำ

- วิเคราะห์ `lab02-smelly.test.ts` และพบ Test Smells ได้แก่ Obscure Test, Eager Test, Assertion Roulette, Conditional Test Logic และ test ที่ไม่มี assertion
- ทดลองแก้ `hashPassword()` ให้คืน plain text เพื่อยืนยันว่า test เดิมรายงานข้อผิดพลาดได้ไม่ชัดเจน แล้วแก้โค้ดกลับให้ถูกต้อง
- ลบ `lab02-smelly.test.ts` ตามโจทย์ แล้วแยก test เป็นไฟล์ที่ตั้งชื่อตามสิ่งที่ทดสอบ
- ปรับ `thaiNationalId.test.ts` ให้ใช้ `it.each` สำหรับกรณีข้อมูลหลายชุด
- เพิ่ม `passwords.test.ts` เพื่อทดสอบการ hash, salt, การตรวจรหัสผ่านถูก/ผิด และ malformed hash
- เพิ่ม `config.test.ts` เพื่อทดสอบค่า default และการอ่านค่า `PORT`, `DATABASE_URL`, `JWT_SECRET`
- เพิ่ม Stretch test ใน `accountService.test.ts` เพื่อตรวจว่า `toPublicUser()` ไม่ส่ง `passwordHash` ออกไป

### แนวคิดที่ได้เรียนรู้

- **Arrange–Act–Assert (AAA)** แบ่ง test เป็นส่วนเตรียมข้อมูล, เรียกพฤติกรรมที่ต้องการทดสอบ, และตรวจผลลัพธ์ ทำให้ test อ่านและแก้ไขง่าย
- **1 test = 1 behavior** และชื่อ test ควรบอกพฤติกรรมที่ระบบต้องทำ ไม่ใช้ชื่อกว้าง ๆ เช่น `works`
- `it.each` ใช้แทน `for` loop เพื่อให้แต่ละชุดข้อมูลเป็น test แยกกัน และระบุกรณีที่ล้มเหลวได้ชัดเจน
- การส่ง `env` เข้า `loadConfig(env)` เป็น parameter ทำให้ test เป็นอิสระ ไม่ต้องแก้ `process.env` ที่เป็น global state
- Test ที่ดีช่วยให้ข้อความ error บอกสาเหตุได้ทันที เช่น password ผิด, hash ผิดรูปแบบ หรือเลขบัตรไม่ถูกต้อง

### ผลการรัน
npm run test:unit
npx jest --selectProjects unit --verbose
```bash
Test Suites: 4 passed, 4 total
Tests:       14 passed, 14 total
Snapshots:   0 total

ชุดทดสอบที่ผ่าน:
- thaiNationalId.test.ts — ตรวจ checksum, ความยาว และรูปแบบเลขบัตร
- passwords.test.ts — ตรวจ hash, salt และการ verify password
- config.test.ts — ตรวจ default configuration และ environment configuration
- accountService.test.ts — ตรวจว่าไม่เปิดเผย passwordHash

---

## Lab 03 — Test Doubles

**Branch:** `pornpimol/lab/03-test-doubles`

### สิ่งที่ทำ

1. ทดสอบ `AccountService.register` ด้วย **Stub** สำหรับ `DistrictRepository` เพื่อควบคุมว่าเขตเลือกตั้งมีอยู่หรือไม่มีอยู่ และใช้ **Dummy** `TokenService` ที่จะ error ทันทีหากถูกเรียกโดยไม่ควรถูกเรียก
2. ใช้ **Spy** กับ `UserRepository.create` เพื่อตรวจว่าระบบส่ง `passwordHash` ไปบันทึก และไม่ส่งรหัสผ่านแบบ plain text
3. ใช้ **Fake** `InMemoryUserRepository` เก็บข้อมูลใน array แทนฐานข้อมูล เพื่อทดสอบกรณีเลขบัตรประชาชนซ้ำ
4. ใช้ **Mock** ตรวจว่าระบบไม่เรียก `create()` เมื่อเลขบัตรประชาชนไม่ถูกต้อง และไม่เรียก `TokenService.issue()` เมื่อเข้าสู่ระบบด้วยรหัสผ่านผิด
5. ใช้ Fake repositories สำหรับ `DistrictRepository`, `PartyRepository` และ `CandidateRepository` เพื่อทดสอบ `ElectionAdminService.addCandidate` โดยไม่เชื่อมต่อฐานข้อมูลจริง
6. ทดสอบกฎผู้สมัคร ได้แก่ สร้างผู้สมัครสำเร็จ, ห้ามใช้หมายเลขซ้ำในเขตเดียวกัน, ห้ามพรรคเดียวส่งผู้สมัครซ้ำในเขตเดียวกัน, อนุญาตหมายเลขซ้ำเมื่อคนละเขต และปฏิเสธพรรคที่ไม่มีอยู่
7. ใช้ **Fake Timers** กำหนดเวลาใน test เพื่อทดสอบ JWT token ที่หมดอายุภายในทันที โดยไม่ต้องรอเวลาจริง

### แนวคิดที่ได้เรียนรู้

- **Dummy** คือ dependency ที่ส่งเข้ามาให้ครบ constructor แต่ test นี้ไม่ควรใช้มัน
- **Stub** คืนค่าที่กำหนดไว้ล่วงหน้า เพื่อควบคุมข้อมูลเข้าทางอ้อมของหน่วยที่กำลังทดสอบ
- **Spy** บันทึกข้อมูลการเรียกใช้ เพื่อตรวจสอบภายหลัง เช่น ข้อมูลที่ส่งไปยัง `create()`
- **Mock** ตรวจสอบพฤติกรรมที่คาดหวังของการเรียก dependency เช่น ต้องไม่บันทึกข้อมูลหรือไม่ออก token
- **Fake** เป็น implementation แบบง่ายที่ทำงานได้จริงในหน่วยความจำ จึงเหมาะเมื่อมี state หรือกฎหลายขั้นตอน
- **Fake Timers** ทำให้ test ที่ขึ้นกับเวลา เช่น token หมดอายุ มีผลลัพธ์แน่นอน รวดเร็ว และไม่ต้องรอเวลาจริง

### ผลการรัน

รันคำสั่ง

```bash
npm run test:unit

## Lab 04 — Test Data Management

- ศึกษา Liquibase migration, rollback, tag, checksum และ context (`dev` / `test` / `e2e`)
- สร้าง Test Data Builders สำหรับ User, Party และ Candidate พร้อมกำหนด seed ของ Faker เพื่อให้ข้อมูลทดสอบสร้างซ้ำได้
- ใช้ Fresh Fixture โดย `truncateAll()` ก่อนแต่ละ Component Test และสร้างข้อมูลผ่าน helper `given(pool)`
- เพิ่ม Component Tests ครอบคลุมการจัดการพรรค การสร้างผู้สมัคร การเปลี่ยน role และการแสดงผู้สมัครเฉพาะเขตของผู้ลงคะแนน
- ตรวจลำดับทดสอบแบบสุ่ม: Integration ผ่าน 2 suites / 8 tests
- สร้าง `scripts/generate-user-seed.ts` เพื่อผลิต Liquibase dev seed สำหรับ Commissioner และตรวจ apply → rollback → apply สำเร็จ
- ผลตรวจสุดท้าย: TypeScript ผ่าน, Unit 7 suites / 31 tests, Integration 2 suites / 8 tests

## Part 2 — Election App Unit Testing

- ออกแบบ Unit Test สำหรับ Feature ECT-F03 การเปิด–ปิดสถานะเลือกตั้ง โดย trace ไปยัง TC-ECT-F03-07 ถึง TC-ECT-F03-16
- เพิ่ม `ElectionStatusService` เพื่อแยกกติกาสถานะ `OPEN` และ `CLOSED` ออกจาก route และ dependency ภายนอก
- Unit Tests ครอบคลุม Happy Path, Alternative/Failure, Stub, Spy, Jest Mock และข้อมูลที่สร้างด้วย Faker
- ทดสอบเปิด/ปิดรายเขต, เปิด/ปิดทุกเขต, ยืนยัน/ยกเลิก และคำสั่งซ้ำแบบ idempotent
- เก็บ branch `pornpimol/backend-original` เป็น baseline ของงาน Backend เดิม และเพิ่มเอกสารเปรียบเทียบกับ branch V&V
- ผลตรวจสุดท้าย: TypeScript ผ่าน, Unit 8 suites / 42 tests, Integration 2 suites / 8 tests, ไม่พบ open handle