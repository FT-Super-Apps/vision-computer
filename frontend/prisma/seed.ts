import { PrismaClient, UserRole, AccountStatus } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@antiplagiasi.com' },
    update: {},
    create: {
      email: 'admin@antiplagiasi.com',
      name: 'Admin User',
      password: adminPassword,
      role: UserRole.ADMIN,
      accountStatus: AccountStatus.ACTIVE,
      isActive: true,
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // Create admin settings
  await prisma.userSettings.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      defaultStrategy: 'unified_bypass',
      autoAnalyze: true,
      notifications: true,
      theme: 'light',
      language: 'id',
    },
  })
  console.log('✅ Admin settings created')

  // Create Test User 1
  const user1Password = await bcrypt.hash('user123', 10)
  const user1 = await prisma.user.upsert({
    where: { email: 'user1@test.com' },
    update: {},
    create: {
      email: 'user1@test.com',
      name: 'Test User 1',
      password: user1Password,
      role: UserRole.USER,
    },
  })
  console.log('✅ Test user 1 created:', user1.email)

  await prisma.userSettings.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      defaultStrategy: 'header_focused',
      autoAnalyze: true,
      notifications: true,
    },
  })

  // Create Test User 2
  const user2Password = await bcrypt.hash('user123', 10)
  const user2 = await prisma.user.upsert({
    where: { email: 'user2@test.com' },
    update: {},
    create: {
      email: 'user2@test.com',
      name: 'Test User 2',
      password: user2Password,
      role: UserRole.USER,
    },
  })
  console.log('✅ Test user 2 created:', user2.email)

  await prisma.userSettings.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      defaultStrategy: 'comprehensive',
      autoAnalyze: false,
      notifications: false,
    },
  })

  // Create Packages
  console.log('\n📦 Creating subscription packages...')

  const packages = [
    {
      code: 'PROPOSAL',
      name: 'Paket Proposal',
      description: 'Paket untuk dokumen proposal skripsi/tesis. Cocok untuk tahap awal penelitian Anda.',
      price: 50000, // Rp 50.000
      currency: 'IDR',
      features: [
        'Bypass dokumen proposal',
        'Maksimal 5 dokumen',
        'File size maksimal 10MB per dokumen',
        'Support format DOCX dan PDF',
        'Hasil dalam 24 jam',
      ],
      maxDocuments: 5,
      maxFileSize: 10,
      validityDays: 30,
      isActive: true,
      order: 1,
    },
    {
      code: 'HASIL',
      name: 'Paket Hasil',
      description: 'Paket untuk dokumen hasil penelitian. Ideal untuk tahap pertengahan hingga akhir penelitian.',
      price: 75000, // Rp 75.000
      currency: 'IDR',
      features: [
        'Bypass dokumen hasil penelitian',
        'Maksimal 10 dokumen',
        'File size maksimal 15MB per dokumen',
        'Support format DOCX dan PDF',
        'Hasil dalam 24 jam',
        'Priority support',
      ],
      maxDocuments: 10,
      maxFileSize: 15,
      validityDays: 30,
      isActive: true,
      order: 2,
    },
    {
      code: 'TUTUP',
      name: 'Paket Tutup (Complete)',
      description: 'Paket lengkap untuk keseluruhan dokumen skripsi/tesis. Solusi terbaik untuk dokumen final Anda.',
      price: 100000, // Rp 100.000
      currency: 'IDR',
      features: [
        'Bypass dokumen lengkap (proposal + hasil)',
        'Unlimited dokumen',
        'File size maksimal 20MB per dokumen',
        'Support semua format (DOCX, PDF, ODT)',
        'Hasil dalam 12 jam',
        'Priority support',
        'Revision jika diperlukan',
        'Konsultasi gratis',
      ],
      maxDocuments: 0, // unlimited
      maxFileSize: 20,
      validityDays: 60,
      isActive: true,
      order: 3,
    },
  ]

  for (const pkg of packages) {
    const created = await prisma.package.upsert({
      where: { code: pkg.code },
      update: {},
      create: pkg,
    })
    console.log(`✅ Package created: ${created.name} (${created.code}) - Rp ${created.price.toLocaleString('id-ID')}`)
  }

  // Create sample strategies
  const strategies = [
    {
      name: 'header_focused',
      displayName: 'Header Focused',
      description: 'Focus on modifying document headers to bypass plagiarism detection',
      category: 'basic',
      defaultConfig: {
        modifyHeaders: true,
        preserveContent: true,
      },
      capabilities: ['header_manipulation', 'metadata_cleaning'],
    },
    {
      name: 'comprehensive',
      displayName: 'Comprehensive Bypass',
      description: 'Complete document transformation using multiple techniques',
      category: 'advanced',
      defaultConfig: {
        deepAnalysis: true,
        multipleStrategies: true,
      },
      capabilities: ['header_manipulation', 'metadata_cleaning', 'content_transformation'],
    },
    {
      name: 'unified_bypass',
      displayName: 'Unified Bypass',
      description: 'Unified approach combining analysis, matching, and bypass',
      category: 'premium',
      defaultConfig: {
        analyzeFirst: true,
        matchSimilarity: true,
        applyBypass: true,
      },
      capabilities: ['analysis', 'matching', 'bypass', 'reporting'],
    },
  ]

  for (const strategy of strategies) {
    await prisma.strategy.upsert({
      where: { name: strategy.name },
      update: {},
      create: strategy,
    })
    console.log(`✅ Strategy created: ${strategy.displayName}`)
  }

  // Create sample activity logs
  await prisma.activityLog.create({
    data: {
      action: 'USER_LOGIN',
      resource: 'auth',
      details: { message: 'Admin logged in' },
      ipAddress: '127.0.0.1',
    },
  })

  await prisma.activityLog.create({
    data: {
      userId: user1.id,
      action: 'DOCUMENT_UPLOAD',
      resource: 'document',
      details: { filename: 'sample_document.docx' },
      ipAddress: '127.0.0.1',
    },
  })

  console.log('✅ Sample activity logs created')

  console.log('\n📝 Test Credentials:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Admin Account:')
  console.log('  Email: admin@antiplagiasi.com')
  console.log('  Password: admin123')
  console.log('  Status: ACTIVE (Full access)')
  console.log('\nUser Account 1:')
  console.log('  Email: user1@test.com')
  console.log('  Password: user123')
  console.log('  Status: PENDING_PROFILE (Need to complete profile)')
  console.log('\nUser Account 2:')
  console.log('  Email: user2@test.com')
  console.log('  Password: user123')
  console.log('  Status: PENDING_PROFILE (Need to complete profile)')
  console.log('\n📦 Available Packages:')
  console.log('  1. PROPOSAL - Rp 50.000 (5 documents, 30 days)')
  console.log('  2. HASIL - Rp 75.000 (10 documents, 30 days)')
  console.log('  3. TUTUP - Rp 100.000 (Unlimited, 60 days)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
