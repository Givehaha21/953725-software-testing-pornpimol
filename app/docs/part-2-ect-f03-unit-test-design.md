# Part 2: ECT-F03 Unit Test Design

## 1. Scope

Feature: ECT-F03 - การควบคุมสถานะการเลือกตั้งรายเขตและทุกเขต

ระบบเดิมมีตาราง `election` แบบแถวเดียว จึงตรวจได้เพียงเวลาเปิดเลือกตั้งรวม
งานปรับปรุงตามหลัก V&V จะเพิ่ม `ElectionStatusService` เพื่อแยกกติกา
การเปิด-ปิดหีบรายเขตออกจาก Express routes และฐานข้อมูล

## 2. Unit under test

`ElectionStatusService`

Dependencies ที่ inject ได้เพื่อให้ทดสอบแบบ isolated:

- `DistrictRepository` - ตรวจสอบว่าเขตเลือกตั้งมีอยู่จริง
- `DistrictElectionStatusRepository` - อ่านและบันทึกสถานะรายเขต
- `Clock` - กำหนดเวลาใน test ได้แน่นอน

สถานะที่รองรับ:

- `OPEN`
- `CLOSED`

## 3. Traceability

| Test Design | Unit test ที่จะทำ |
|---|---|
| TC-ECT-F03-07 | เปิดเขตที่ปิดอยู่สำเร็จ |
| TC-ECT-F03-08 | ปิดเขตที่เปิดอยู่สำเร็จ |
| TC-ECT-F03-09 | ยืนยันเปิดทุกเขต |
| TC-ECT-F03-10 | ยกเลิกเปิดทุกเขตแล้วสถานะเดิมคงอยู่ |
| TC-ECT-F03-11 | สั่งเปิดทุกเขตซ้ำอย่างปลอดภัย |
| TC-ECT-F03-12 | ยืนยันปิดทุกเขต |
| TC-ECT-F03-13 | ยกเลิกปิดทุกเขตแล้วสถานะเดิมคงอยู่ |
| TC-ECT-F03-14 | สั่งปิดทุกเขตซ้ำอย่างปลอดภัย |
| TC-ECT-F03-15 | เขตเปิดอนุญาตให้ลงคะแนน |
| TC-ECT-F03-16 | เขตปิดไม่อนุญาตให้ลงคะแนน |

TC-ECT-F03-01 ถึง TC-ECT-F03-06 เป็นการแสดงผล ค้นหา และกรองหน้า UI
จึงอยู่นอกขอบเขต Unit Test ของ backend service นี้ และจะเก็บเป็นหลักฐาน
สำหรับ UI/E2E testing ในอนาคต

## 4. Required test techniques

| Requirement | Test evidence |
|---|---|
| Success / Happy Path | เปิดเขตที่ปิดอยู่แล้วได้สถานะ `OPEN` |
| Alternative / Failure | เปิดเขตที่ไม่มีอยู่ต้องได้ `NotFoundError` |
| Stub | Stub repository คืนสถานะ `CLOSED` เพื่อทดสอบการเปิดเขต |
| Spy | Spy ตรวจว่า repository บันทึกสถานะและเวลาเพียงครั้งเดียว |
| Mock | Jest mock ตรวจ interaction ของคำสั่งเปิด/ปิดทุกเขต |
| Faker | สร้างข้อมูลเขตแบบ dynamic ด้วย Faker และทดสอบการเปิดเขต |

## 5. Test isolation

ทุก Unit Test จะไม่ใช้ PostgreSQL, Docker หรือ Express app
และใช้ fake/stub/mock repository ที่สร้างใหม่ในแต่ละ test
เพื่อให้ test รันซ้ำและรันสลับลำดับได้โดยไม่ขึ้นต่อกัน