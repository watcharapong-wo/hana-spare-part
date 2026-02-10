# 🔧 IT Spare Parts Management System

ระบบจัดการอะไหล่ IT แบบครบวงจร พัฒนาด้วย Node.js, Express.js และ SQLite3

## ✨ Features

- 🔐 **Authentication & Authorization** - ระบบ Login และจัดการสิทธิ์ผู้ใช้ (Admin, Staff)
- 📦 **Spare Parts Management** - จัดการข้อมูลอะไหล่ (CRUD)
- 📝 **Transaction Management** - บันทึกการเบิก-คืนอะไหล่
- 📊 **Stock Alerts** - แจ้งเตือนอะไหล่ใกล้หมด
- 📈 **Reports & Analytics** - รายงานสรุปสต็อกและประวัติการเบิก-คืน
- 💾 **Excel Export** - ส่งออกรายงานเป็นไฟล์ Excel
- 👥 **User Management** - จัดการผู้ใช้งานระบบ (Admin only)
- 🎨 **Modern UI** - หน้าเว็บที่ใช้งานง่าย Responsive Design

## 🛠 Tech Stack

**Backend:**
- Node.js + Express.js
- SQLite3
- JWT Authentication
- bcrypt.js (Password Hashing)
- ExcelJS (Excel Export)
- Multer (File Upload)

**Frontend:**
- HTML5
- CSS3 (Modern Design)
- Vanilla JavaScript
- Fetch API

## 📋 Requirements

- Node.js >= 14.x
- npm >= 6.x

## 🚀 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd it-spareparts
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

สร้างไฟล์ `.env` ในโฟลเดอร์หลัก:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=3000
```

หรือคัดลอกจาก `.env.example`:

```bash
cp .env.example .env
```

### 4. Initialize database

```bash
node database/init.js
```

สคริปต์นี้จะ:
- สร้างฐานข้อมูล SQLite (`spareparts.db`)
- สร้างตารางทั้งหมด
- สร้างผู้ใช้งานเริ่มต้น (admin)

### 5. Start the server

```bash
node index.js
```

Server จะรันที่ `http://localhost:3000`

## 👤 Default Users

ระบบจะสร้างผู้ใช้งานเริ่มต้น 2 คน:

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| `admin` | `admin123` | admin | ผู้ดูแลระบบ (สิทธิ์เต็ม) |
| `staff` | `staff123` | staff | พนักงาน (สิทธิ์จำกัด) |

⚠️ **แนะนำ:** เปลี่ยนรหัสผ่านหลังจาก login ครั้งแรก

## 📂 Project Structure

```
it-spareparts/
├── database/
│   ├── db.js                    # Database connection
│   ├── init.js                  # Database initialization
│   ├── init_users.js            # User table setup
│   ├── init_transactions.js     # Transaction table setup
│   └── seed_admin.js            # Create default admin user
├── middleware/
│   ├── auth.js                  # JWT authentication middleware
│   └── validators.js            # Request validation middleware
├── routes/
│   ├── auth.js                  # Authentication endpoints
│   ├── users.js                 # User management endpoints
│   ├── spareparts.js            # Spare parts endpoints
│   ├── transactions.js          # Transaction endpoints
│   ├── reports.js               # Reports & exports
│   ├── imports.js               # Import functionality
│   └── custom_fields.js         # Custom fields
├── public/
│   ├── index.html               # Login page
│   ├── dashboard.html           # Main dashboard
│   ├── css/
│   │   └── styles.css           # Global styles
│   └── js/
│       ├── api.js               # API client
│       └── app.js               # Main application logic
├── utils/
│   └── respond.js               # Response helpers
├── .env                         # Environment variables (create this)
├── .env.example                 # Environment template
├── index.js                     # Main server file
├── package.json                 # Dependencies
└── README.md                    # This file
```

## 📡 API Endpoints

### Authentication

```
POST   /auth/login              # Login
```

### Users (Admin only)

```
GET    /users                   # Get all users
POST   /users                   # Create new user
PUT    /users/:id               # Update user
DELETE /users/:id               # Delete user
```

### Spare Parts

```
GET    /spareparts              # Get all spare parts (query: ?q=name&location=...)
GET    /spareparts/:id          # Get spare part by ID
GET    /spareparts/low-stock    # Get low stock items
POST   /spareparts              # Create spare part (Admin)
PUT    /spareparts/:id          # Update spare part (Admin)
DELETE /spareparts/:id          # Delete spare part (Admin)
```

### Transactions

```
GET    /transactions            # Get all transactions
POST   /transactions/issue      # Issue spare part (Staff/Admin)
POST   /transactions/return     # Return spare part (Staff/Admin)
DELETE /transactions/:id        # Delete transaction (Admin)
```

### Reports

```
GET    /reports/stock-summary           # Get stock summary with low stock items
GET    /reports/recent-transactions      # Get recent transactions
GET    /reports/export/stock-summary     # Export stock summary to Excel
GET    /reports/export/recent-transactions # Export transactions to Excel
```

## 🎯 Usage

### เข้าสู่ระบบ

1. เปิดเบราว์เซอร์และไปที่ `http://localhost:3000`
2. ใช้ username และ password ตามตารางด้านบน
3. กด "เข้าสู่ระบบ"

### จัดการอะไหล่

**เพิ่มอะไหล่ใหม่ (Admin):**
1. ไปที่เมนู "อะไหล่"
2. คลิก "➕ เพิ่มอะไหล่"
3. กรอกข้อมูล: ชื่อ, จำนวน, จำนวนขั้นต่ำ, สถานที่, หมายเหตุ
4. คลิก "💾 บันทึก"

### เบิก-คืนอะไหล่

**เบิกของ:**
1. ไปที่เมนู "รายการเบิก-คืน"
2. คลิก "📤 เบิกของ"
3. เลือกอะไหล่, ระบุจำนวน และชื่อผู้เบิก
4. คลิก "💾 บันทึก"

**คืนของ:**
- ทำเหมือนการเบิก แต่คลิก "📥 คืนของ" แทน

### ส่งออกรายงาน

1. ไปที่เมนู "รายงาน"
2. เลือกรายงานที่ต้องการ
3. คลิก "💾 Export Excel"
4. ไฟล์จะถูกดาวน์โหลดอัตโนมัติ

## 🔒 Security Features

- ✅ Password hashing ด้วย bcrypt
- ✅ JWT token authentication
- ✅ Role-based access control (RBAC)
- ✅ SQL injection prevention (Parameterized queries)
- ✅ CORS enabled

## 📝 Development

### ติดตั้ง Dependencies เพิ่ม

```bash
npm install <package-name>
```

### Database Migrations

เพิ่ม migration ใหม่:

```bash
node database/migrate_<name>.js
```

### ทดสอบ API

ใช้ Postman หรือ curl:

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get spare parts (with token)
curl -X GET http://localhost:3000/spareparts \
  -H "Authorization: Bearer <your-token>"
```

## 🐛 Troubleshooting

**ปัญหา: Cannot find module 'xyz'**
```bash
npm install
```

**ปัญหา: Port 3000 already in use**
- เปลี่ยน PORT ในไฟล์ `.env`
- หรือหยุด process ที่ใช้พอร์ตอยู่

**ปัญหา: Database locked**
- ปิดโปรแกรมที่เปิดไฟล์ `spareparts.db` อยู่
- Restart server

**ปัญหา: 401 Unauthorized**
- ตรวจสอบ token ใน Authorization header
- Login ใหม่เพื่อรับ token ใหม่

## 🔄 Updates & Improvements

### ❌ สิ่งที่ยังขาด (Future Enhancements)

- [ ] Unit Tests & Integration Tests
- [ ] API Rate Limiting
- [ ] Activity Logging
- [ ] Email Notifications
- [ ] Barcode/QR Code Support
- [ ] Mobile App
- [ ] Advanced Analytics
- [ ] Multi-language Support

## 📄 License

ISC

## 👨‍💻 Author

ฮะนะลปัน (HANALPN)

## 🙏 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

**Made with ❤️ by HANALPN Team**
