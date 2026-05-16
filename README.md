# 💸 Chi Tiêu — Ứng dụng quản lý tài chính cá nhân

Ứng dụng web quản lý chi tiêu tối giản, hiện đại, tối ưu cho mobile. Xây dựng với Next.js 15, Prisma, Supabase và deploy trên Vercel.

---

## ✨ Tính năng chính

### 🏠 Dashboard
- Hiển thị **tổng số dư** tất cả tài khoản
- Danh sách tài khoản: Tiền mặt, Ngân hàng, Ví điện tử, Nguồn khác
- Mỗi tài khoản có tên, số dư, icon và màu nhận diện riêng
- 2 action nhanh: **Thêm chi tiêu** và **Chuyển tiền**

### ➕ Thêm chi tiêu
- Bottom sheet mượt mà, thân thiện mobile
- Tự động lấy thời gian hiện tại
- Upload hoặc chụp ảnh hoá đơn (lưu trên Supabase Storage)
- Tự động **trừ số dư** tài khoản sau khi lưu

### 🔄 Chuyển tiền (Transfer)
- Chọn tài khoản nguồn và tài khoản đích
- Tự động **trừ ví nguồn**, **cộng ví đích**
- Lưu lịch sử dưới dạng giao dịch Transfer

### 📋 Lịch sử giao dịch
- Hiển thị tất cả Expense và Transfer
- Group theo ngày
- Preview ảnh hoá đơn nếu có
- **Xoá** giao dịch → tự động hoàn lại số dư
- Skeleton loading khi đang tải dữ liệu

### 🔐 Xác thực
- Đăng nhập bằng **Google OAuth** (NextAuth.js)
- Dữ liệu được bảo vệ theo từng user

---

## 🛠 Công nghệ sử dụng

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| Next.js | 15.5.18 | Framework chính, App Router |
| React | 19.1.0 | UI library |
| TypeScript | 5.x | Type safety |
| Prisma | 6.x | ORM, quản lý database |
| Supabase | 2.x | PostgreSQL + Storage ảnh |
| NextAuth.js | 4.x | Google OAuth |
| Tailwind CSS | 4.x | Styling |
| Sonner | 2.x | Toast notifications |
| Framer Motion | 12.x | Animation |
| next-themes | 0.4.x | Dark / Light mode |
| lucide-react | 0.511.x | Icon library |
| Vercel | — | Deploy & hosting |

---

## 📁 Cấu trúc dự án

```
expense-tracker/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts                # Dữ liệu mẫu
│   └── migrations/            # Lịch sử migration
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── wallets/route.ts
│   │   │   └── transactions/
│   │   │       ├── route.ts
│   │   │       └── [id]/route.ts
│   │   ├── history/
│   │   │   └── page.tsx       # Trang lịch sử giao dịch
│   │   ├── globals.css
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Dashboard
│   ├── components/
│   │   ├── layout/
│   │   │   ├── BottomNav.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── providers/
│   │   │   └── Providers.tsx  # SessionProvider + ThemeProvider
│   │   └── transactions/
│   │       ├── ExpenseModal.tsx
│   │       └── TransferModal.tsx
│   ├── lib/
│   │   ├── auth.ts            # NextAuth config
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── supabase.ts        # Supabase client + uploadImage
│   │   └── utils.ts           # formatCurrency, cn, formatDate
│   └── types/
│       └── index.ts           # TypeScript types
├── .env                       # Environment variables (không commit)
├── .env.example               # Template biến môi trường
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🗄 Database Schema

```prisma
model Wallet {
  id        String     @id @default(cuid())
  name      String
  balance   Decimal    @db.Decimal(15, 2)
  type      WalletType  # CASH | BANK | EWALLET | OTHER
  color     String
  icon      String
  userId    String
}

model Transaction {
  id           String          @id @default(cuid())
  type         TransactionType  # EXPENSE | TRANSFER
  amount       Decimal         @db.Decimal(15, 2)
  note         String?
  imageUrl     String?
  fromWalletId String
  toWalletId   String?
  userId       String
  createdAt    DateTime
}
```

---

## 🚀 Cài đặt & chạy local

### 1. Clone và cài dependencies

```bash
git clone <repo-url>
cd expense-tracker
npm install
```

### 2. Tạo file `.env` từ template

```bash
cp .env.example .env
```

Điền đầy đủ các biến sau:

```env
# Database (Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-32-chars"

# Google OAuth (Google Cloud Console)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

### 3. Chạy migration và seed

```bash
# Tạo bảng trong database
npm run db:migrate

# Đăng nhập Google trên localhost:3000 trước, sau đó seed dữ liệu mẫu
npm run db:seed
```

### 4. Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt.

---

## ☁️ Deploy lên Vercel

1. Push code lên GitHub
2. Vào [vercel.com](https://vercel.com) → Import project
3. Thêm tất cả biến môi trường trong **Settings → Environment Variables**
4. Thêm `NEXTAUTH_URL` = domain Vercel của bạn (ví dụ: `https://chi-tieu.vercel.app`)
5. Deploy!

> **Lưu ý:** Cập nhật **Authorized redirect URIs** trong Google Cloud Console với domain Vercel mới.

---

## 📱 Screenshots

> Dashboard · Thêm chi tiêu · Chuyển tiền · Lịch sử giao dịch

*(Thêm ảnh chụp màn hình sau khi hoàn thiện UI)*

---

## 📝 Scripts

```bash
npm run dev          # Chạy development server
npm run build        # Build production
npm run start        # Chạy production server
npm run db:migrate   # Chạy Prisma migration
npm run db:seed      # Seed dữ liệu mẫu
npm run db:studio    # Mở Prisma Studio (GUI database)
npm run db:push      # Push schema không tạo migration file
```

---

## 👤 Tác giả

Dự án thực tập — Quản lý chi tiêu cá nhân  
Xây dựng với ❤️ bằng Next.js + Supabase + Prisma
