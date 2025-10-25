# Anti-Plagiasi Frontend

Modern Next.js fullstack application untuk document bypass system dengan Prisma, Shadcn UI, dan integrasi Python API.

⚡ **Created by devnolife**

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL dengan Prisma ORM
- **UI Library**: Shadcn UI + Radix UI + TailwindCSS
- **Authentication**: NextAuth.js
- **API Integration**: Axios untuk komunikasi dengan Python API

### Separation of Concerns

#### Next.js Fullstack (Port 3000)
Menangani **Data Masters**:
- 👤 User Management (register, login, profile)
- 📄 Document Management (metadata, list, search)
- 📊 History & Analytics (bypass records, statistics)
- ⚙️  Settings & Configuration
- 📈 Dashboard & Reporting

#### Python API (Port 8000)
Menangani **Bypass Processing**:
- 🔥 Document bypass dengan berbagai strategi
- 📝 Document analysis & flag detection
- 🔍 OCR processing untuk PDF
- 🎯 AI-powered text manipulation

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ dan npm/yarn
- PostgreSQL database
- Python API (port 8000) harus sudah running

### 1. Installation

```bash
cd frontend
npm install
```

### 2. Environment Setup

Copy `.env.example` ke `.env` dan sesuaikan:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/antiplagiasi"
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="http://localhost:3000"
PYTHON_API_URL="http://localhost:8000"
```

### 3. Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Push schema ke database
npm run db:push

# (Optional) Open Prisma Studio
npm run db:studio
```

### 4. Run Development Server

```bash
npm run dev
```

App akan running di **http://localhost:3000** 🎉

---

## 📁 Project Structure

```
frontend/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── documents/       # Document CRUD endpoints
│   │   ├── bypass/          # Bypass history endpoints
│   │   └── users/           # User management endpoints
│   ├── dashboard/           # Dashboard pages
│   ├── documents/           # Document management pages
│   ├── history/             # Bypass history pages
│   ├── auth/                # Auth pages (login/register)
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Homepage
│
├── components/
│   ├── ui/                  # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   └── layout/              # Layout components
│       ├── header.tsx
│       ├── sidebar.tsx
│       └── footer.tsx
│
├── lib/
│   ├── prisma.ts            # Prisma client singleton
│   ├── utils.ts             # Utility functions
│   └── api/
│       └── python-client.ts # Python API integration
│
├── prisma/
│   └── schema.prisma        # Database schema
│
├── public/                  # Static assets
│
└── package.json
```

---

## 🗄️ Database Schema

### Core Models:

#### User
- Authentication & profile management
- Role-based access control (ADMIN, USER, GUEST)
- Relations to documents and bypass history

#### Document
- Metadata penyimpanan dokumen
- Status tracking (PENDING, ANALYZING, COMPLETED, etc)
- File info (size, type, page count, word count)

#### DocumentAnalysis
- Hasil analisis dari Python API
- Flag detection results
- OCR text extraction
- Plagiarism scoring

#### BypassHistory
- Log semua bypass operations
- Strategy yang digunakan
- Processing metrics (time, success rate)
- Output file references

#### Strategy
- Konfigurasi bypass strategies
- Usage statistics
- Performance metrics

#### SystemStats
- Daily statistics
- API usage tracking
- Storage metrics

---

## 🔌 API Integration

### Python API Client

File: `lib/api/python-client.ts`

#### Methods:

```typescript
// Analyze document for flags
await pythonAPI.analyzeDocument(file, filename)

// Perform bypass
await pythonAPI.bypassDocument(file, filename, strategy)

// Unified process (analyze + bypass)
await pythonAPI.unifiedProcess(file, filename, strategy)

// Get available strategies
await pythonAPI.getStrategies()

// OCR processing
await pythonAPI.ocrPdf(file, filename)

// Health check
await pythonAPI.healthCheck()
```

---

## 🎨 UI Components (Shadcn)

### Available Components:

✅ **Basic:**
- Button
- Card
- Input
- Label

🔜 **To be added:**
- Dialog
- Dropdown Menu
- Toast
- Progress Bar
- Tabs
- Select
- Avatar
- Badge
- Alert

### Adding More Components

```bash
# Example: Add Dialog component
npx shadcn-ui@latest add dialog
```

---

## 📊 Features Overview

### ✅ Current Features:
- Project structure setup
- Database schema design
- Python API integration client
- Basic UI components
- Homepage layout

### 🚧 To be Implemented:

#### Authentication
- [ ] Login/Register pages
- [ ] NextAuth.js setup
- [ ] Session management
- [ ] Protected routes

#### Document Management
- [ ] Upload document interface
- [ ] Document list view
- [ ] Document details page
- [ ] Search & filter
- [ ] Delete document

#### Bypass Processing
- [ ] Strategy selection UI
- [ ] Upload & process workflow
- [ ] Progress tracking
- [ ] Download results
- [ ] Retry failed processes

#### Dashboard
- [ ] Statistics overview
- [ ] Recent activities
- [ ] Quick actions
- [ ] Charts & analytics

#### History
- [ ] Bypass history table
- [ ] Filter by date/status/strategy
- [ ] Export history
- [ ] Details view

#### Settings
- [ ] User profile
- [ ] Preferences
- [ ] API configuration
- [ ] Theme toggle

---

## 🔐 Authentication Flow

1. User registers/logs in via NextAuth.js
2. Credentials verified against Prisma database
3. JWT token generated
4. Session stored and managed
5. Protected routes check session
6. User info available in `useSession()` hook

---

## 📝 Development Guide

### API Routes Pattern

```typescript
// app/api/documents/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const documents = await prisma.document.findMany()
  return NextResponse.json(documents)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const document = await prisma.document.create({ data })
  return NextResponse.json(document)
}
```

### Using Python API Client

```typescript
import { pythonAPI } from '@/lib/api/python-client'

// In API route or server component
const result = await pythonAPI.analyzeDocument(file, filename)

// Handle response
if (result.success) {
  // Save to database
  await prisma.documentAnalysis.create({
    data: {
      documentId: docId,
      flagCount: result.flag_count,
      flagTypes: result.flag_types,
      // ...
    }
  })
}
```

### Using Prisma

```typescript
import { prisma } from '@/lib/prisma'

// Create
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    password: hashedPassword
  }
})

// Read with relations
const document = await prisma.document.findUnique({
  where: { id: docId },
  include: {
    user: true,
    analysis: true,
    bypasses: true
  }
})

// Update
await prisma.document.update({
  where: { id: docId },
  data: { status: 'COMPLETED' }
})

// Delete
await prisma.document.delete({
  where: { id: docId }
})
```

---

## 🧪 Testing

```bash
# Run tests (to be implemented)
npm test

# Run linter
npm run lint
```

---

## 🚢 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

Ensure all environment variables are set:
- `DATABASE_URL` - Production PostgreSQL URL
- `NEXTAUTH_SECRET` - Strong secret key
- `NEXTAUTH_URL` - Production URL
- `PYTHON_API_URL` - Production Python API URL

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Shadcn UI](https://ui.shadcn.com/)
- [NextAuth.js](https://next-auth.js.org/)
- [TailwindCSS](https://tailwindcss.com/)

---

## 🤝 Contributing

1. Create feature branch
2. Implement feature with tests
3. Run linter and fix issues
4. Submit pull request

---

## 📄 License

Private - Created by devnolife

---

## 💡 Next Steps

1. **Setup database**: Create PostgreSQL database dan run migrations
2. **Implement Auth**: Setup NextAuth.js untuk authentication
3. **Build Dashboard**: Create dashboard UI dengan statistics
4. **Document Upload**: Implement upload interface dengan drag & drop
5. **Bypass Flow**: Create end-to-end bypass workflow
6. **History View**: Build history table dengan filters
7. **Settings Page**: User preferences dan configuration
8. **Testing**: Add unit dan integration tests
9. **Deployment**: Deploy ke production (Vercel/Railway)

---

⚡ **Made with ❤️ by devnolife**
