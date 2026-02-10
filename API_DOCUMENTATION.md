# 📡 API Documentation

ระบบ IT Spare Parts Management API

**Base URL:** `http://localhost:3000`

**Content-Type:** `application/json`

---

## 🔐 Authentication

ใช้ JWT (JSON Web Token) สำหรับ Authentication

### การใช้งาน Token

ส่ง token ใน Header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 📋 API Endpoints

### 🔑 Authentication

#### POST /auth/login
Login เข้าสู่ระบบ

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "full_name": "Administrator",
    "role": "admin"
  }
}
```

**Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### 👥 Users Management

❗ **Requires:** Authentication (Admin role)

#### GET /users
ดึงรายการผู้ใช้งานทั้งหมด

**Response (200):**
```json
{
  "message": "Users list",
  "data": [
    {
      "id": 1,
      "username": "admin",
      "full_name": "Administrator",
      "role": "admin",
      "created_at": "2026-02-05T10:00:00.000Z"
    }
  ]
}
```

#### POST /users
สร้างผู้ใช้งานใหม่

**Request Body:**
```json
{
  "username": "john",
  "password": "password123",
  "full_name": "John Doe",
  "role": "staff"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created",
  "id": 3
}
```

**Validation:**
- `username`: required, 3-50 characters
- `password`: required, min 6 characters
- `role`: required, either "admin" or "staff"

#### PUT /users/:id
แก้ไขข้อมูลผู้ใช้งาน

**Request Body:**
```json
{
  "full_name": "John Smith",
  "role": "admin",
  "password": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated"
}
```

#### DELETE /users/:id
ลบผู้ใช้งาน

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted"
}
```

---

### 📦 Spare Parts Management

❗ **Requires:** Authentication

#### GET /spareparts
ดึงรายการอะไหล่

**Query Parameters:**
- `q` (optional): ค้นหาตามชื่อ
- `location` (optional): กรองตามสถานที่

**Example:**
```
GET /spareparts?q=mouse&location=คลังหลัก
```

**Response (200):**
```json
{
  "message": "Spareparts list",
  "data": [
    {
      "id": 1,
      "name": "Wireless Mouse",
      "quantity": 50,
      "min_stock": 10,
      "location": "คลังหลัก",
      "note": "Logitech M185",
      "created_by": 1,
      "created_by_username": "admin",
      "created_by_full_name": "Administrator",
      "created_at": "2026-02-05T10:00:00.000Z",
      "updated_at": "2026-02-05T10:00:00.000Z"
    }
  ]
}
```

#### GET /spareparts/:id
ดึงข้อมูลอะไหล่ตาม ID

**Response (200):**
```json
{
  "message": "Sparepart details",
  "data": {
    "id": 1,
    "name": "Wireless Mouse",
    "quantity": 50,
    "min_stock": 10,
    "location": "คลังหลัก",
    "note": "Logitech M185"
  }
}
```

#### GET /spareparts/low-stock
ดึงรายการอะไหล่ที่ใกล้หมด (quantity <= min_stock)

**Response (200):**
```json
{
  "message": "Low stock items",
  "data": [
    {
      "id": 5,
      "name": "HDMI Cable",
      "quantity": 3,
      "min_stock": 10,
      "location": "คลังหลัก"
    }
  ]
}
```

#### POST /spareparts
สร้างอะไหล่ใหม่ (Admin only)

**Request Body:**
```json
{
  "name": "USB Flash Drive 32GB",
  "quantity": 100,
  "min_stock": 20,
  "location": "คลังหลัก",
  "note": "SanDisk Ultra"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Sparepart created",
  "id": 10
}
```

**Validation:**
- `name`: required, 1-200 characters
- `quantity`: required, integer >= 0
- `min_stock`: required, integer >= 0

#### PUT /spareparts/:id
แก้ไขอะไหล่ (Admin only)

**Request Body:**
```json
{
  "name": "USB Flash Drive 64GB",
  "quantity": 80,
  "min_stock": 15,
  "location": "คลังหลัก",
  "note": "SanDisk Ultra 64GB"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Sparepart updated"
}
```

#### DELETE /spareparts/:id
ลบอะไหล่ (Admin only)

**Response (200):**
```json
{
  "success": true,
  "message": "Sparepart deleted"
}
```

---

### 📝 Transactions Management

❗ **Requires:** Authentication (Staff or Admin)

#### GET /transactions
ดึงรายการเบิก-คืนทั้งหมด

**Response (200):**
```json
{
  "message": "Transactions list",
  "data": [
    {
      "id": 1,
      "sparepart_id": 1,
      "sparepart_name": "Wireless Mouse",
      "type": "issue",
      "qty": 5,
      "requester": "สมชาย ใจดี",
      "note": "สำหรับห้องประชุม",
      "created_by": 1,
      "created_by_username": "admin",
      "created_by_full_name": "Administrator",
      "created_at": "2026-02-05T14:30:00.000Z"
    }
  ]
}
```

#### POST /transactions/issue
เบิกอะไหล่ (ลด stock)

**Request Body:**
```json
{
  "sparepart_id": 1,
  "qty": 5,
  "requester": "สมชาย ใจดี",
  "note": "สำหรับห้องประชุม"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Issue recorded",
  "transaction_id": 15,
  "remaining_stock": 45
}
```

**Error (400) - Not enough stock:**
```json
{
  "success": false,
  "message": "Not enough stock",
  "details": {
    "current_stock": 3
  }
}
```

**Validation:**
- `sparepart_id`: required, must exist
- `qty`: required, integer > 0
- `requester`: required, 1-100 characters

#### POST /transactions/return
คืนอะไหล่ (เพิ่ม stock)

**Request Body:**
```json
{
  "sparepart_id": 1,
  "qty": 2,
  "requester": "สมชาย ใจดี",
  "note": "คืนของเหลือใช้"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Return recorded",
  "transaction_id": 16,
  "new_stock": 47
}
```

#### DELETE /transactions/:id
ลบรายการเบิก-คืน (Admin only)

⚠️ **หมายเหตุ:** การลบจะไม่ปรับสต็อกย้อนกลับ

**Response (200):**
```json
{
  "success": true,
  "message": "Transaction deleted"
}
```

---

### 📊 Reports & Analytics

❗ **Requires:** Authentication

#### GET /reports/stock-summary
รายงานสรุปสต็อกและอะไหล่ใกล้หมด

**Response (200):**
```json
{
  "message": "Stock summary",
  "summary": {
    "total_items": 25,
    "total_quantity": 1250,
    "low_stock_items": 3
  },
  "low_stock": [
    {
      "id": 5,
      "name": "HDMI Cable",
      "quantity": 3,
      "min_stock": 10,
      "location": "คลังหลัก"
    }
  ]
}
```

#### GET /reports/recent-transactions
รายการเบิก-คืนล่าสุด

**Query Parameters:**
- `limit` (optional): จำนวนรายการ (default: 20, max: 200)

**Example:**
```
GET /reports/recent-transactions?limit=10
```

**Response (200):**
```json
{
  "message": "Recent transactions",
  "data": [
    {
      "id": 15,
      "sparepart_name": "Wireless Mouse",
      "type": "issue",
      "qty": 5,
      "requester": "สมชาย ใจดี",
      "created_at": "2026-02-05T14:30:00.000Z"
    }
  ]
}
```

#### GET /reports/export/stock-summary
Export รายงานสรุปสต็อกเป็น Excel

**Response:** Excel file (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

**Filename:** `stock-summary-YYYY-MM-DD.xlsx`

#### GET /reports/export/recent-transactions
Export รายงานเบิก-คืนล่าสุดเป็น Excel

**Query Parameters:**
- `limit` (optional): จำนวนรายการ (default: 50)

**Response:** Excel file (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

**Filename:** `recent-transactions-YYYY-MM-DD.xlsx`

---

### 📥 Import Management

❗ **Requires:** Authentication (Admin only)

#### POST /imports/spareparts
นำเข้าอะไหล่จาก Excel

**Request:** multipart/form-data
- `file`: Excel file (.xlsx)

**Excel Format:**
| name | quantity | min_stock | location | note |
|------|----------|-----------|----------|------|
| Mouse | 100 | 10 | คลังหลัก | Logitech |

**Response (200):**
```json
{
  "success": true,
  "message": "Import successful",
  "imported": 25,
  "errors": []
}
```

#### GET /imports/template/spareparts
ดาวน์โหลด Template Excel สำหรับนำเข้า

**Response:** Excel file template

---

## 🔒 Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error",
  "error": "Field 'name' is required"
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized",
  "error": "No token provided"
}
```

### 403 Forbidden
```json
{
  "message": "Forbidden",
  "error": "Admin role required"
}
```

### 404 Not Found
```json
{
  "message": "Not found",
  "error": "Sparepart not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Server error",
  "error": "Database connection failed"
}
```

---

## 🧪 Testing with curl

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Get Spare Parts (with token)
```bash
TOKEN="your-jwt-token-here"

curl -X GET http://localhost:3000/spareparts \
  -H "Authorization: Bearer $TOKEN"
```

### Create Spare Part
```bash
curl -X POST http://localhost:3000/spareparts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "USB Cable",
    "quantity": 50,
    "min_stock": 10,
    "location": "คลังหลัก"
  }'
```

### Issue Spare Part
```bash
curl -X POST http://localhost:3000/transactions/issue \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sparepart_id": 1,
    "qty": 5,
    "requester": "สมชาย ใจดี",
    "note": "สำหรับห้องประชุม"
  }'
```

### Export Report
```bash
curl -X GET http://localhost:3000/reports/export/stock-summary \
  -H "Authorization: Bearer $TOKEN" \
  --output stock-summary.xlsx
```

---

## 📚 Postman Collection

สามารถ import collection นี้เข้า Postman:

```json
{
  "info": {
    "name": "IT Spare Parts API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\"username\":\"admin\",\"password\":\"admin123\"}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

---

**Last Updated:** February 5, 2026
