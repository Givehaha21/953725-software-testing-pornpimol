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
