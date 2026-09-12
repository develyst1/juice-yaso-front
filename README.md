# juice-yaso-front

Juice Yaso v1 — Next.js (App Router) + TypeScript + Tailwind  
เรียกเฉพาะ back API ตาม `juice-yaso-spec` `docs/contracts/api.md` — **ห้ามต่อ Postgres**

## หน้า
- `/` สั่งลัง/รส (ปนได้) + ชื่อเบอร์ → ได้บัตรคิว
- `/q/[queueCode]` สถานะ ชำระ QR/บัญชี อัปสลิป ยกเลิก เหตุผลปฏิเสธ
- `/admin` ลิสต์ออเดอร์ อนุมัติ/ปฏิเสธสลิป เลื่อนสถานะ แก้ราคา/ช่องทางโอน คืนลัง

ไม่มี login ลูกค้า · ไม่มีส่งของ · ไม่มีดูออเดอร์เก่าถ้าไม่มีรหัสคิว

## รันคู่กับ back
1. เปิด `juice-yaso-back` ตาม README (`docker-compose` + `PORT=3000`)
2. คัดลอก env แล้วรันหน้าเว็บ

```bash
cp .env.example .env.local
npm install
npm run dev
```

เปิด http://localhost:3000 ของ **back** คือ API  
หน้าเว็บ Next ค่าเริ่มต้นคือพอร์ต 3001 ถ้า 3000 ถูก back ใช้แล้ว — ตั้ง `next dev -p 3001`

แอดมิน: ใส่ `ADMIN_TOKEN` ของ back ในช่องบน `/admin` (เก็บใน sessionStorage เท่านั้น)

## ช่องว่างสัญญา
`GET /api/v1/admin/orders` ไม่คืน `slipId` — แอดมินกรอก slipId จาก back ตอนอนุมัติ/ปฏิเสธ ไม่ได้ invent endpoint ใหม่
