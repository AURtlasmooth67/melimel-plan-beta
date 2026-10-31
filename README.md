# 🍓 MELiMEL FRUITY♡ BETA (คู่มือการติดตั้งและการใช้งานเว็บทดสอบ)

เว็บทดสอบเวอร์ชันใหม่ของระบบตารางคอนเทนต์กลุ่มครีเอเตอร์ MELiMEL FRUITY♡ พัฒนาขึ้นใหม่ด้วยโครงสร้าง **Vite + TypeScript + Firebase** (แยกโปรเจกต์และฐานข้อมูลจากเว็บเดิม 100%)

---

## 🔒 1. การตั้งค่า Firebase โครงการใหม่ (แพลนฟรี Spark)

1. ไปที่ [Firebase Console](https://console.firebase.google.com/) แล้วกด **"Create a project" (สร้างโปรเจกต์)**
   - ตั้งชื่อโปรเจกต์ใหม่ เช่น `kalabro-testdeploy`
   - ปิด Google Analytics หรือเปิดตามสะดวก (ไม่มีค่าใช้จ่าย)
2. **เปิดใช้งาน Authentication:**
   - ไปที่เมนู **Build > Authentication > Sign-in method**
   - เปิดใช้งาน **Google**
3. **เปิดใช้งาน Cloud Firestore:**
   - ไปที่เมนู **Build > Firestore Database > Create database**
   - เลือก Location ใกล้เคียง (เช่น `asia-southeast1` หรือ default)
   - เริ่มต้นในโหมด Production
4. **ลงทะเบียน Web App:**
   - ไปที่ **Project Settings (รูปฟันเฟือง) > General > Your apps** กดปุ่มรูปไอคอนเว็บ `</>`
   - ตั้งชื่อ เช่น `melimel-beta-web`
   - คัดลอกค่าคอนฟิก `firebaseConfig` มาใส่ในไฟล์ `.env`

---

## ⚙️ 2. ตั้งค่าไฟล์ `.env`

คัดลอกจาก `.env.example` มาเป็น `.env`:
```env
VITE_FIREBASE_API_KEY=ใส่_apiKey_ที่ได้จาก_Firebase_Console
VITE_FIREBASE_AUTH_DOMAIN=kalabro-testdeploy.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=kalabro-testdeploy
VITE_FIREBASE_STORAGE_BUCKET=kalabro-testdeploy.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=ใส่_sender_id
VITE_FIREBASE_APP_ID=ใส่_app_id

# บัญชีแอดมินคนแรก (ต้องตรงกับ Google Account ของคุณ)
VITE_INITIAL_ADMIN_EMAIL=poopo7096@gmail.com
```

---

## 🚀 3. คำสั่งทดสอบและ Deploy ไปยัง Firebase Hosting

เปิดโปรแกรม Terminal หรือ PowerShell ในโฟลเดอร์ `x:\TESTWEB`:

### 3.1 รันดูเว็บทดสอบในเครื่อง (Local Dev)
```bash
npm run dev
```
เปิดบราวเซอร์ไปที่ `http://localhost:5173`

### 3.2 ทดสอบชุดคำสั่งอัตโนมัติ (Unit Tests)
```bash
npm test
```

### 3.3 Deploy ขึ้น Firebase Hosting ของจริง
```bash
# 1. ล็อกอิน Firebase ด้วยบัญชีของคุณ (ทำครั้งแรก)
npx firebase login

# 2. เชื่อมต่อไปยังโปรเจกต์ที่สร้างใหม่
npx firebase use --add

# 3. บิลด์ไฟล์โปรเจกต์
npm run build

# 4. ดีพลอย Security Rules และ Hosting
npx firebase deploy --only firestore:rules,hosting
```

---

## 🌟 4. ฟีเจอร์ที่พัฒนาครบถ้วนในระบบทดสอบ (Phase 0 - Phase 3)

1. **วันนี้ของฉัน (Home):** รู้เรื่องใน 3 วินาที แสดงงานด่วนวันนี้/พรุ่งนี้ และปุ่มเพิ่มเพลงด่วน
2. **คลังเพลง (Song Library):** ค้นหา, กรองตามผู้ทำ/สถานะ, กรอง "ยังไม่ลงตาราง" + สรุปตัวเลขสถิติ
3. **ปฏิทินงาน (Calendar):** มุมมองสัปดาห์/เดือน, แตะวางเพลงลงวัน (≤2 แตะ), เคลียร์ช่วงวันที่เลือกพร้อมปุ่มกู้คืน (Undo)
4. **คัมบัง (Kanban Board):** รองรับ Desktop Drag & Drop และ Mobile Dropdown เปลี่ยนสถานะ มีจุดพลุ Confetti ฉลองเมื่อเสร็จ
5. **ผู้ช่วยจัดตาราง 3 ขั้น (Smart Scheduler):** ทั้งโหมด Auto ทั้งทีม และ Routine รายคน
6. **ตั๋วงานของทีม (Tickets):** มอบหมายงาน, ความสำคัญ, กำหนดส่ง, คอมเมนต์, และปุ่มคัดลอกส่งต่อแชท 1 แตะ (Base64 Safe Code)
7. **งานใหญ่ & เป้าหมาย (Big Jobs & Goals):** นับถอยหลังวันเดดไลน์ และแถบความคืบหน้ายอดซับ
8. **ตัวสร้างภาพแพลนเนอร์ 1248×1248 (Lazy-load):** ดึงตาราง 7 วัน, ใส่รูปตัวละคร, ซูม/หมุน และบันทึก PNG/JPG
9. **ส่งออกข้อมูล (Data Exporter):** รองรับไฟล์ JSON, CSV (Excel), และ iCalendar (.ics)
10. **แผงแอดมิน (Admin Panel):** ตั้งค่าและเปลี่ยนภาพพื้นหลังส่วนกลางของทีม (ทุกคนเห็นตรงกัน)
11. **ตัวนำเข้า JSON เดิมแบบ Dry-Run:** ตรวจสอบความถูกต้องและรายงานผลก่อนเขียนจริง ปลอดภัย 100%

---

## 🛡️ 5. สิทธิ์และความปลอดภัย (Security Rules)
- ผู้ใช้ต้องล็อกอินผ่าน **Google** เท่านั้น
- ผู้ใช้ที่ไม่มีรายชื่อในระบบ หรือไม่ได้เป็นสมาชิก จะไม่สามารถอ่านหรือเขียนข้อมูลใดๆ ได้
- แอดมินคนแรก (`poopo7096@gmail.com`) ได้รับสิทธิ์จัดการสมาชิกและตั้งค่าระบบทันทีที่เข้าสู่ระบบ
