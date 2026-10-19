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