# juice-yaso-front

Juice Yaso — Next.js App Router + TypeScript + **Mantine v7** + Tabler icons  
เรียกเฉพาะ back API ตาม `juice-yaso-spec` `docs/contracts/api.md` — **ห้ามต่อ Postgres**

UI v2 ตาม `docs/ui/` · ห้าม emoji · โทนส้ม/ครีม

## โครงโฟลเดอร์
- `src/app/` routes บาง
- `src/features/{order,queue,admin,payment}/`
- `src/shared/{api,ui,lib,config,assets}/`
- `src/theme/` Mantine theme

## หน้า
- `/` สั่งลัง/รส + ชื่อเบอร์
- `/q/[queueCode]` บัตรคิว ชำระ อัปสลิป ยกเลิก
- `/admin` ลิสต์ออเดอร์ สลิป สถานะ ราคา/ช่องทางโอน

## รันคู่กับ back
```bash
cp .env.example .env.local
npm install
npm run dev
```
back `:4013` · front `:3022` · แอดมินใส่ `ADMIN_TOKEN` ใน `/admin` (sessionStorage)
