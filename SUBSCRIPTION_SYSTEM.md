# 💳 Subscription System Documentation

## 📋 Overview

Sistem paket berlangganan dengan verifikasi pembayaran manual oleh admin. Users harus memilih paket, upload bukti pembayaran, dan menunggu verifikasi admin sebelum dapat menggunakan layanan.

---

## 🎯 User Flow

### 1. **Registration** → **Complete Profile** → **Select Package** → **Upload Payment** → **Wait Verification** → **Active**

```
┌─────────────┐
│   Register  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Complete Profile   │ → Lengkapi data diri (nama, telepon, alamat, institusi, dll)
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Select Package     │ → Pilih paket: PROPOSAL / HASIL / TUTUP
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Upload Payment     │ → Upload bukti transfer + isi data pembayaran
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Awaiting Verification│ → Status: PENDING_VERIFICATION
└──────┬──────────────┘
       │
       ▼
  ┌────────────────┐
  │ Admin Verifies │
  └────────┬───────┘
           │
      ┌────┴────┐
      │         │
   VERIFY    REJECT
      │         │
      ▼         ▼
  ┌─────┐   ┌────────┐
  │ACTIVE│   │PENDING │
  │      │   │PAYMENT │
  └─────┘   └────────┘
```

---

## 📦 Packages (Paket Berlangganan)

### 1. **Paket PROPOSAL**
- **Harga**: Rp 50.000
- **Durasi**: 30 hari
- **Fitur**:
  - Bypass dokumen proposal
  - Maksimal 5 dokumen
  - File size maks 10MB per dokumen
  - Support DOCX dan PDF
  - Hasil dalam 24 jam

### 2. **Paket HASIL**
- **Harga**: Rp 75.000
- **Durasi**: 30 hari
- **Fitur**:
  - Bypass dokumen hasil penelitian
  - Maksimal 10 dokumen
  - File size maks 15MB per dokumen
  - Support DOCX dan PDF
  - Hasil dalam 24 jam
  - Priority support

### 3. **Paket TUTUP (Complete)**
- **Harga**: Rp 100.000
- **Durasi**: 60 hari
- **Fitur**:
  - Bypass dokumen lengkap
  - **Unlimited dokumen**
  - File size maks 20MB per dokumen
  - Support semua format
  - Hasil dalam 12 jam
  - Priority support
  - Revision jika diperlukan
  - Konsultasi gratis

---

## 🗄️ Database Schema

### User Model (Updated)
```typescript
model User {
  id            String
  email         String         @unique
  name          String
  password      String
  role          UserRole       @default(USER)

  // NEW: Account Status
  accountStatus AccountStatus  @default(PENDING_PROFILE)
  isActive      Boolean        @default(false)

  // Relations
  profile       UserProfile?
  subscriptions Subscription[]
  paymentProofs PaymentProof[]
  ...
}

enum AccountStatus {
  PENDING_PROFILE       // Belum lengkapi profile
  PENDING_PAYMENT       // Belum upload bukti pembayaran
  PENDING_VERIFICATION  // Menunggu verifikasi admin
  ACTIVE                // Sudah terverifikasi, bisa akses fitur
  SUSPENDED             // Akun di-suspend
  EXPIRED               // Langganan habis
}
```

### UserProfile (NEW)
```typescript
model UserProfile {
  id              String
  userId          String   @unique

  // Personal Info
  fullName        String
  phone           String
  address         String?
  city            String?
  province        String?
  postalCode      String?

  // Academic Info
  institution     String?   // Universitas/Sekolah
  major           String?   // Jurusan
  studentId       String?   // NIM/NIS
  purpose         String?   // Tujuan penggunaan
}
```

### Package (NEW)
```typescript
model Package {
  id              String
  code            String   @unique  // PROPOSAL, HASIL, TUTUP
  name            String
  description     String
  price           Int                 // dalam rupiah
  currency        String   @default("IDR")

  // Limits
  features        Json                // List fitur
  maxDocuments    Int      @default(0)    // 0 = unlimited
  maxFileSize     Int      @default(10)   // dalam MB
  validityDays    Int      @default(30)   // Durasi paket

  isActive        Boolean  @default(true)
  order           Int      @default(0)
}
```

### PaymentProof (NEW)
```typescript
model PaymentProof {
  id              String
  userId          String
  packageId       String

  // Payment Info
  paymentMethod   String            // Transfer Bank, E-Wallet
  accountName     String            // Nama pengirim
  accountNumber   String?
  amount          Int

  // Proof File
  proofImageUrl   String            // Path to uploaded image
  originalFilename String
  fileSize        Int
  transactionDate DateTime
  notes           String?

  // Verification
  status          PaymentStatus     @default(PENDING)
  verifiedBy      String?           // Admin ID
  verifiedAt      DateTime?
  rejectionReason String?
  adminNotes      String?
}

enum PaymentStatus {
  PENDING       // Menunggu verifikasi
  VERIFIED      // Sudah diverifikasi
  REJECTED      // Ditolak
}
```

### Subscription (NEW)
```typescript
model Subscription {
  id              String
  userId          String
  packageId       String
  paymentProofId  String   @unique

  // Period
  startDate       DateTime?         // Mulai setelah verified
  endDate         DateTime?         // startDate + validityDays

  // Status
  status          SubscriptionStatus @default(PENDING)
  isActive        Boolean           @default(false)
  documentsUsed   Int               @default(0)
}

enum SubscriptionStatus {
  PENDING       // Menunggu verifikasi payment
  ACTIVE        // Aktif dan bisa digunakan
  EXPIRED       // Sudah habis masa berlaku
  CANCELLED     // Dibatalkan
}
```

---

## 🔌 API Endpoints

### User Endpoints

#### 1. **GET /api/packages**
Get list of available packages
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "code": "PROPOSAL",
      "name": "Paket Proposal",
      "price": 50000,
      "features": [...],
      "maxDocuments": 5,
      "validityDays": 30
    }
  ]
}
```

#### 2. **POST /api/profile/complete**
Complete user profile after registration
```json
// Request
{
  "fullName": "John Doe",
  "phone": "08123456789",
  "address": "Jl. Example",
  "city": "Jakarta",
  "institution": "Universitas Indonesia",
  "major": "Teknik Informatika",
  "studentId": "1234567890",
  "purpose": "Skripsi"
}

// Response
{
  "success": true,
  "data": { ... },
  "nextStep": "PAYMENT"
}
```

#### 3. **POST /api/payment/upload**
Upload payment proof (FormData)
```
file: <image file>
packageId: "..."
paymentMethod: "Transfer Bank BCA"
accountName: "John Doe"
amount: "50000"
transactionDate: "2025-01-15"
notes: "Optional notes"
```

#### 4. **GET /api/payment/status**
Get current user's payment status and subscription info
```json
{
  "success": true,
  "data": {
    "accountStatus": "PENDING_VERIFICATION",
    "isActive": false,
    "latestPaymentProof": {
      "status": "PENDING",
      "amount": 50000,
      "package": {...}
    },
    "activeSubscription": null
  }
}
```

#### 5. **GET /api/user/account-status**
Get account status for redirect logic
```json
{
  "success": true,
  "data": {
    "accountStatus": "PENDING_PROFILE",
    "nextStep": "COMPLETE_PROFILE",
    "redirectUrl": "/subscription/complete-profile"
  }
}
```

### Admin Endpoints

#### 1. **GET /api/admin/payments/pending**
Get all payment proofs (with filters)
```
Query params:
- status: PENDING | VERIFIED | REJECTED | ALL
- page: 1
- limit: 20
```

#### 2. **POST /api/admin/payments/verify**
Verify or reject payment proof
```json
// Request
{
  "paymentProofId": "...",
  "action": "VERIFY" | "REJECT",
  "rejectionReason": "...",  // Required if REJECT
  "adminNotes": "..."        // Optional
}

// Response
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "paymentProof": { "status": "VERIFIED" },
    "subscription": {
      "status": "ACTIVE",
      "startDate": "2025-01-15",
      "endDate": "2025-02-14"
    },
    "user": {
      "accountStatus": "ACTIVE",
      "isActive": true
    }
  }
}
```

---

## 🎨 Frontend Pages

### User Pages

#### 1. **/subscription/complete-profile**
- Form untuk lengkapi data diri
- Fields: fullName, phone, address, institution, major, studentId, purpose
- After submit → redirect to `/subscription/select-package`

#### 2. **/subscription/select-package**
- Display 3 paket dalam card grid
- User pilih salah satu paket
- Button "Lanjut ke Pembayaran"
- Redirect to `/subscription/payment?packageId=xxx`

#### 3. **/subscription/payment**
- Tampilkan informasi rekening bank
- Form upload bukti transfer
  - Payment method
  - Nama pengirim
  - Nomor rekening
  - Jumlah transfer
  - Tanggal transfer
  - Upload gambar bukti (max 5MB)
  - Catatan (optional)
- After submit → redirect to `/subscription/verification-status`

#### 4. **/subscription/verification-status**
- Tampilkan status pembayaran:
  - **PENDING**: "Menunggu verifikasi admin (maks 1x24 jam)"
  - **VERIFIED**: "Pembayaran terverifikasi! Akun aktif"
  - **REJECTED**: "Pembayaran ditolak" + alasan + button upload ulang
- Tampilkan detail bukti pembayaran
- Jika ACTIVE: tampilkan info subscription (masa aktif, dokumen terpakai)
- Auto-refresh setiap 30 detik

### Admin Pages

#### 5. **/admin/payments**
- List semua payment proofs
- Filter: PENDING | VERIFIED | REJECTED | ALL
- Setiap item tampilkan:
  - User info (nama, email, phone, institusi)
  - Package yang dipilih
  - Jumlah pembayaran
  - Metode pembayaran
  - Tanggal transfer
  - Status badge
  - Button "Lihat Detail"
- Modal detail:
  - Tampilkan gambar bukti transfer (besar)
  - Detail lengkap pembayaran
  - Form verifikasi (VERIFY / REJECT)
  - If REJECT: wajib isi alasan
  - Admin notes (optional)
  - Button "Simpan Verifikasi"

---

## 🔄 Redirect Logic After Login

```typescript
switch (accountStatus) {
  case 'PENDING_PROFILE':
    redirect to '/subscription/complete-profile'
    break

  case 'PENDING_PAYMENT':
    redirect to '/subscription/select-package'
    break

  case 'PENDING_VERIFICATION':
    redirect to '/subscription/verification-status'
    break

  case 'ACTIVE':
    redirect to '/dashboard'
    break

  case 'SUSPENDED':
    redirect to '/subscription/suspended'
    break

  case 'EXPIRED':
    redirect to '/subscription/renew'
    break
}

// Admin always goes to '/admin'
```

---

## ✅ Verification Flow (Admin)

### When Admin VERIFIES:

1. Update `paymentProof.status` → `VERIFIED`
2. Set `paymentProof.verifiedBy` → Admin ID
3. Set `paymentProof.verifiedAt` → Current time
4. Update `subscription.status` → `ACTIVE`
5. Set `subscription.isActive` → `true`
6. Calculate `subscription.startDate` → Now
7. Calculate `subscription.endDate` → Now + package.validityDays
8. Update `user.accountStatus` → `ACTIVE`
9. Set `user.isActive` → `true`
10. Log activity: `PAYMENT_VERIFIED`

### When Admin REJECTS:

1. Update `paymentProof.status` → `REJECTED`
2. Set `paymentProof.verifiedBy` → Admin ID
3. Set `paymentProof.verifiedAt` → Current time
4. Set `paymentProof.rejectionReason` → Admin's reason
5. Update `subscription.status` → `CANCELLED`
6. Set `subscription.isActive` → `false`
7. Update `user.accountStatus` → `PENDING_PAYMENT`
8. Set `user.isActive` → `false`
9. Log activity: `PAYMENT_REJECTED`

---

## 🧪 Testing Flow

### 1. **Setup Database**
```bash
cd frontend
npm run db:generate
npm run db:push
npm run db:seed
```

This will create:
- Admin: `admin@rumahplagiasi.com` / `admin123` (ACTIVE)
- User1: `user1@test.com` / `user123` (PENDING_PROFILE)
- 3 packages: PROPOSAL, HASIL, TUTUP

### 2. **Test User Flow**

1. **Register new user:**
   - Go to `/auth/register`
   - Register with new email

2. **Login:**
   - Login with new credentials
   - Should redirect to `/subscription/complete-profile`

3. **Complete profile:**
   - Fill all required fields
   - Submit
   - Should redirect to `/subscription/select-package`

4. **Select package:**
   - Choose one package (e.g., PROPOSAL)
   - Click "Lanjut ke Pembayaran"
   - Should redirect to `/subscription/payment?packageId=xxx`

5. **Upload payment proof:**
   - Fill payment details
   - Upload screenshot of transfer
   - Submit
   - Should redirect to `/subscription/verification-status`

6. **Check status:**
   - Should see "Menunggu Verifikasi"
   - Status: PENDING

### 3. **Test Admin Verification**

1. **Login as admin:**
   - Email: `admin@rumahplagiasi.com`
   - Password: `admin123`

2. **Go to `/admin/payments`**
   - Should see pending payment from test user

3. **Click "Lihat Detail":**
   - View payment proof image
   - Fill verification form

4. **Option A - Verify:**
   - Select "Verifikasi"
   - Add admin notes (optional)
   - Click "Simpan Verifikasi"
   - User account should become ACTIVE

5. **Option B - Reject:**
   - Select "Tolak"
   - Fill rejection reason (required)
   - Click "Simpan Verifikasi"
   - User should go back to PENDING_PAYMENT

### 4. **Verify User Access**

1. **Login as verified user:**
   - Should redirect to `/dashboard`
   - Can now upload and process documents

2. **Check subscription:**
   - Go to `/subscription/verification-status`
   - Should see ACTIVE subscription
   - View start/end dates
   - View documents used count

---

## 📁 Files Created

### Database
- `frontend/prisma/schema.prisma` - Updated with new models
- `frontend/prisma/seed.ts` - Updated with packages

### API Endpoints
- `frontend/app/api/packages/route.ts`
- `frontend/app/api/profile/complete/route.ts`
- `frontend/app/api/payment/upload/route.ts`
- `frontend/app/api/payment/status/route.ts`
- `frontend/app/api/user/account-status/route.ts`
- `frontend/app/api/admin/payments/pending/route.ts`
- `frontend/app/api/admin/payments/verify/route.ts`

### Frontend Pages
- `frontend/app/subscription/complete-profile/page.tsx`
- `frontend/app/subscription/select-package/page.tsx`
- `frontend/app/subscription/payment/page.tsx`
- `frontend/app/subscription/verification-status/page.tsx`
- `frontend/app/admin/payments/page.tsx`

### Updated Files
- `frontend/app/auth/login/page.tsx` - Added redirect logic

---

## 🎯 Key Features

✅ **Complete User Flow**: Registration → Profile → Package → Payment → Verification → Active
✅ **Manual Payment Verification**: Admin reviews and verifies each payment
✅ **Package System**: 3 tiers with different limits and features
✅ **Account Status Tracking**: Multiple states (PENDING_PROFILE, PENDING_PAYMENT, etc.)
✅ **Payment Proof Upload**: Image upload with validation (type, size)
✅ **Admin Dashboard**: Dedicated page for payment verification
✅ **Real-time Status**: Auto-refresh for verification status
✅ **Rejection Flow**: Admin can reject with reason, user can re-upload
✅ **Automatic Subscription Activation**: On verification, subscription auto-activates
✅ **Usage Tracking**: Track documents used per subscription

---

## 🔒 Security

- ✅ Session-based authentication
- ✅ Role-based authorization (Admin vs User)
- ✅ Server-side file upload validation
- ✅ Protected API routes
- ✅ Payment proof stored securely
- ✅ User can only see their own data
- ✅ Admin required for verification

---

## 📝 Next Steps (Optional Enhancements)

1. **Email Notifications:**
   - Send email when payment verified
   - Send email when payment rejected
   - Reminder email before subscription expires

2. **Automatic Expiration:**
   - Cron job to check and expire subscriptions
   - Update user status to EXPIRED when endDate passes

3. **Subscription Renewal:**
   - Allow users to renew expired subscriptions
   - Discount for renewals

4. **Payment Gateway Integration:**
   - Integrate with Midtrans/Xendit for auto-verification
   - Support credit card, e-wallet, etc.

5. **Usage Limits Enforcement:**
   - Check `documentsUsed` before processing
   - Prevent processing if limit reached

6. **Subscription History:**
   - View all past subscriptions
   - Download invoices

---

**Created by devnolife** 🚀
