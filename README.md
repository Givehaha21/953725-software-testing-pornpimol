---
---

## งานส่วนที่ 1: Software Testing Workshop

ได้ทำ Workshop การทดสอบซอฟต์แวร์ตั้งแต่ Lab 00 ถึง Lab 04 โดยประยุกต์ใช้กับระบบ Election App

### หัวข้อที่ทำ

- **Lab 00 — Setup:** ตรวจสอบความพร้อมของเครื่องและทดลองรัน Unit Test, Integration Test และ E2E Test
- **Lab 01 — Boundary Test Cases:** ทดสอบเลขบัตรประชาชนไทยด้วย Boundary Value Analysis เช่น 12, 13 และ 14 หลัก
- **Lab 02 — Arrange–Act–Assert:** ปรับ Unit Test ให้มีโครงสร้าง AAA ชัดเจน และทดสอบ password, config และข้อมูลผู้ใช้
- **Lab 03 — Test Doubles:** ใช้ Dummy, Stub, Spy, Mock, Fake และ Fake Timers ใน Unit Test
- **Lab 04 — Test Data Management:** ใช้ Test Data Builder, Faker, Fresh Fixture, Database Isolation และ Component Test กับ PostgreSQL จริง

### ผลลัพธ์ที่ได้

- เพิ่ม Unit Test สำหรับ validation, password, token, account service และ election management
- เพิ่ม Component Test สำหรับสมัครสมาชิก, จัดการพรรค, สร้างผู้สมัคร, เปลี่ยนบทบาทผู้ใช้ และแสดงผู้สมัครตามเขต
- ใช้ Liquibase และ Docker Compose จัดการฐานข้อมูลสำหรับ development และ test
- แยกข้อมูลทดสอบของแต่ละ test เพื่อป้องกัน test รบกวนกันเอง
- สร้าง seed data สำหรับ Commissioner ด้วย Faker และ Liquibase

รายละเอียดการทำ Workshop อยู่ในไฟล์ [workshop_log.md](workshop_log.md)


## งานส่งส่วนที่ 2: Election App Unit Testing

งานนี้ออกแบบและพัฒนา Unit Test สำหรับ Feature ECT-F03 การเปิด–ปิดสถานะการเลือกตั้ง โดยอ้างอิง Test Case TC-ECT-F03-07 ถึง TC-ECT-F03-16

### การติดตั้งและรันงาน

1. ติดตั้ง Node.js และเปิด Docker Desktop
2. Clone repository และเปลี่ยนไปยัง branch งานส่ง

```bash
git clone https://github.com/Givehaha21/953725-software-testing-pornpimol.git
cd 953725-software-testing-pornpimol
git switch pornpimol/part-2-election-unit-tests
cd app
npm ci
```

3. ตรวจสอบ TypeScript และรัน Unit Test

```bash
npx tsc --noEmit
npm run test:unit
```

4. รัน Integration Test กับ PostgreSQL

```bash
npm run test:integration
```

หากต้องการตรวจ resource ที่อาจค้างหลังจบ Integration Test ให้ใช้:

```bash
npx jest --selectProjects integration --runInBand --detectOpenHandles
```

### ผลการทดสอบ

- Unit Test: 8 test suites / 42 tests ผ่าน
- Integration Test: 2 test suites / 8 tests ผ่าน
- ตรวจ TypeScript และ open handles ผ่าน

### แนวคิดการทดสอบที่นำมาใช้

- **Arrange–Act–Assert (AAA):** จัดโครงสร้าง test เป็นการเตรียมข้อมูล เรียกใช้งาน และตรวจผลลัพธ์
- **Happy Path และ Alternative/Failure Path:** ทดสอบทั้งกรณีทำงานสำเร็จและกรณีข้อมูลหรือเงื่อนไขไม่ถูกต้อง
- **Stub:** ควบคุมผลลัพธ์ของ dependency เพื่อทดสอบเฉพาะกติกาที่ต้องการ
- **Spy:** ตรวจสอบการเรียกใช้งานและข้อมูลที่ส่งไปยัง dependency
- **Mock:** จำลอง dependency และตรวจพฤติกรรมที่คาดหวัง
- **Faker:** สร้างข้อมูลทดสอบแบบ dynamic โดยไม่ใช้ข้อมูลจริง
- **Test Isolation:** Unit Test ไม่เชื่อมต่อฐานข้อมูลหรือ Express และแต่ละ test ไม่แชร์ state กัน

### เอกสารประกอบ

- [Unit Test Design สำหรับ ECT-F03](app/docs/part-2-ect-f03-unit-test-design.md)
- [เปรียบเทียบโค้ดเดิมและโค้ดที่ปรับปรุง](app/docs/part-2-code-comparison.md)
- Unit Test หลัก: [electionStatusService.test.ts](app/test/unit/electionStatusService.test.ts)