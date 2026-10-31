# MELiMEL FRUITY♡ Beta

ระบบตารางคอนเทนต์และจัดการงานสำหรับทีม MELiMEL FRUITY♡ พัฒนาด้วย Vite, TypeScript และ Firebase พร้อมเครื่องมือสร้างรูปตารางงาน 1248×1248 พิกเซล

- เว็บแอป: https://kalabro-testdeploy.web.app
- เครื่องมือสร้างรูปตารางงาน: https://kalabro-testdeploy.web.app/planner-image/
- คู่มือสถาปัตยกรรมโค้ด: [MELiMEL_Planner_Image_Engine_Codebook.pdf](MELiMEL_Planner_Image_Engine_Codebook.pdf)

## 1. การตั้งค่า Firebase

1. สร้างโปรเจกต์ใหม่ใน [Firebase Console](https://console.firebase.google.com/)
2. เปิดใช้งาน Authentication และเลือกวิธีลงชื่อเข้าใช้เป็น Google
3. สร้างฐานข้อมูล Cloud Firestore ในโหมด Production และเลือก Location ที่ใกล้ที่สุด (เช่น `asia-southeast1`)
4. เพิ่ม Web App ในหน้า Project Settings แล้วคัดลอกค่าคอนฟิกไปใส่ใน `.env`

## 2. ตั้งค่าไฟล์ .env

คัดลอกไฟล์จาก `.env.example` แล้วใส่ค่าคอนฟิกจาก Firebase Console:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# อีเมล Google Account สำหรับสิทธิ์แอดมินคนแรก
VITE_INITIAL_ADMIN_EMAIL=admin@example.com
```

## 3. การรันและ Deploy

รันในเครื่อง (Local Development):
```bash
npm run dev
```
เปิดเบราว์เซอร์ที่ `http://localhost:5173`

รันการทดสอบ (Tests):
```bash
npm test
```

บิลด์และ Deploy ขึ้น Firebase Hosting:
```bash
npm run build
npx firebase-tools deploy --only firestore:rules,hosting
```

## 4. ความสามารถของระบบ

- **หน้าวันนี้:** สรุปงานและนัดหมายของวันนี้และวันพรุ่งนี้
- **คลังเพลง:** ค้นหา กรองสถานะ และระบุเพลงที่ยังไม่ได้ลงในตาราง
- **ปฏิทิน:** ปฏิทินแบบรายสัปดาห์และรายเดือน ลากหรือแตะวางเพลงลงวัน และมีปุ่ม Undo เมื่อเคลียร์ช่วงวันที่เลือก
- **กระดานคัมบัง:** จัดการสถานะงานตามขั้นตอน พร้อมรองรับการลากวางบนเดสก์ท็อปและดรอปดาวน์บนมือถือ
- **ตัวช่วยจัดตาราง:** จัดตารางซ้อมอัตโนมัติทั้งทีมหรือตามตารางประจำตัวบุคคล
- **ตั๋วงาน:** มอบหมายงาน กำหนดวันส่ง ติดแท็กความสำคัญ และคัดลอกรหัสแชร์ส่งต่อในแชต
- **เป้าหมายและเดดไลน์:** นับถอยหลังวันกำหนดส่งและติดตามความคืบหน้าของทีม
- **ตัวสร้างภาพตารางงาน 1248×1248:** ดึงตาราง 7 วันมาใส่ในแม่แบบ ใส่รูปภาพ ปรับขนาด หมุน และส่งออกเป็น PNG หรือ JPG
- **การนำออกและนำเข้าข้อมูล:** ส่งออกข้อมูลเป็น JSON, CSV และ iCalendar (.ics) และนำเข้าข้อมูลจากไฟล์ JSON เดิมพร้อมรายงานผลก่อนบันทึกจริง
- **ระบบแอดมิน:** กำหนดภาพพื้นหลังและจัดการสิทธิ์ของสมาชิก

## 5. ความปลอดภัยและการเข้าถึง

- เข้าสู่ระบบด้วย Google Account เท่านั้น
- ผู้ใช้ที่ไม่มีรายชื่อในระบบจะไม่สามารถอ่านหรือแก้ไขข้อมูลใน Firestore ได้
- บัญชีที่ระบุใน `VITE_INITIAL_ADMIN_EMAIL` จะได้รับสิทธิ์แอดมินในการจัดการข้อมูลและสมาชิก
