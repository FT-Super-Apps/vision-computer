/**
 * Database Seed Script for Rumah Plagiasi
 *
 * This script populates the database with initial data for development and testing.
 *
 * Run with: npx prisma db seed
 * or: npm run db:seed
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...\n')

  // Clear existing data (optional - be careful in production!)
  console.log('🗑️  Cleaning existing data...')
  await prisma.activityLog.deleteMany()
  await prisma.systemStats.deleteMany()
  await prisma.bypassHistory.deleteMany()
  await prisma.documentAnalysis.deleteMany()
  await prisma.document.deleteMany()
  await prisma.strategy.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.paymentProof.deleteMany()
  await prisma.userProfile.deleteMany()
  await prisma.userSettings.deleteMany()
  await prisma.package.deleteMany()
  await prisma.user.deleteMany()
  console.log('✅ Data cleaned\n')

  // ==================== USERS ====================
  console.log('👤 Creating users...')

  const hashedPassword = await bcrypt.hash('password123', 10)
  const hashedAdminPassword = await bcrypt.hash('admin123', 10)

  // Admin User
  const admin = await prisma.user.create({
    data: {
      email: 'admin@rumahplagiasi.com',
      name: 'Admin Rumah Plagiasi',
      password: hashedAdminPassword,
      role: 'ADMIN',
      accountStatus: 'ACTIVE',
      isActive: true,
      emailVerified: new Date(),
    },
  })
  console.log(`   ✓ Admin: ${admin.email}`)

  // User 1 - Sudah complete profile, pending payment
  const user1 = await prisma.user.create({
    data: {
      email: 'andi.saputra@student.ui.ac.id',
      name: 'Andi Saputra',
      password: hashedPassword,
      role: 'USER',
      accountStatus: 'PENDING_PAYMENT',
      isActive: false,
      emailVerified: new Date(),
    },
  })
  console.log(`   ✓ User: ${user1.email}`)

  // User 2 - Sudah upload payment, pending verification
  const user2 = await prisma.user.create({
    data: {
      email: 'siti.permata@student.ugm.ac.id',
      name: 'Siti Permata',
      password: hashedPassword,
      role: 'USER',
      accountStatus: 'PENDING_VERIFICATION',
      isActive: false,
      emailVerified: new Date(),
    },
  })
  console.log(`   ✓ User: ${user2.email}`)

  // User 3 - Active subscriber
  const user3 = await prisma.user.create({
    data: {
      email: 'budi.pratama@student.itb.ac.id',
      name: 'Budi Pratama',
      password: hashedPassword,
      role: 'USER',
      accountStatus: 'ACTIVE',
      isActive: true,
      emailVerified: new Date(),
    },
  })
  console.log(`   ✓ User: ${user3.email}`)

  // User 4 - New user, belum complete profile
  const user4 = await prisma.user.create({
    data: {
      email: 'maya.dewi@student.unair.ac.id',
      name: 'Maya Dewi',
      password: hashedPassword,
      role: 'USER',
      accountStatus: 'PENDING_PROFILE',
      isActive: false,
      emailVerified: new Date(),
    },
  })
  console.log(`   ✓ User: ${user4.email}`)

  // User 5 - Expired subscription
  const user5 = await prisma.user.create({
    data: {
      email: 'rudi.hermawan@student.its.ac.id',
      name: 'Rudi Hermawan',
      password: hashedPassword,
      role: 'USER',
      accountStatus: 'EXPIRED',
      isActive: false,
      emailVerified: new Date(),
    },
  })
  console.log(`   ✓ User: ${user5.email}\n`)

  // ==================== USER SETTINGS ====================
  console.log('⚙️  Creating user settings...')

  await prisma.userSettings.createMany({
    data: [
      {
        userId: admin.id,
        defaultStrategy: 'comprehensive',
        autoAnalyze: true,
        notifications: true,
        theme: 'dark',
        language: 'id',
      },
      {
        userId: user1.id,
        defaultStrategy: 'header_focused',
        autoAnalyze: true,
        notifications: true,
        theme: 'light',
        language: 'id',
      },
      {
        userId: user2.id,
        defaultStrategy: 'metadata_bypass',
        autoAnalyze: true,
        notifications: true,
        theme: 'light',
        language: 'id',
      },
      {
        userId: user3.id,
        defaultStrategy: 'comprehensive',
        autoAnalyze: true,
        notifications: true,
        theme: 'light',
        language: 'id',
      },
      {
        userId: user5.id,
        defaultStrategy: 'header_focused',
        autoAnalyze: false,
        notifications: false,
        theme: 'light',
        language: 'id',
      },
    ],
  })
  console.log('   ✓ User settings created\n')

  // ==================== USER PROFILES ====================
  console.log('📋 Creating user profiles...')

  await prisma.userProfile.create({
    data: {
      userId: user1.id,
      fullName: 'Andi Saputra',
      phone: '081234567890',
      address: 'Jl. Salemba Raya No. 4',
      city: 'Jakarta Pusat',
      province: 'DKI Jakarta',
      postalCode: '10430',
      institution: 'Universitas Indonesia',
      major: 'Teknik Informatika',
      studentId: '1806123456',
      purpose: 'Skripsi S1',
    },
  })
  console.log(`   ✓ Profile for ${user1.name}`)

  await prisma.userProfile.create({
    data: {
      userId: user2.id,
      fullName: 'Siti Permata',
      phone: '082345678901',
      address: 'Jl. Bulaksumur',
      city: 'Sleman',
      province: 'D.I. Yogyakarta',
      postalCode: '55281',
      institution: 'Universitas Gadjah Mada',
      major: 'Ilmu Komunikasi',
      studentId: '20/444567/SP/12345',
      purpose: 'Tesis S2',
    },
  })
  console.log(`   ✓ Profile for ${user2.name}`)

  await prisma.userProfile.create({
    data: {
      userId: user3.id,
      fullName: 'Budi Pratama',
      phone: '083456789012',
      address: 'Jl. Ganesha No. 10',
      city: 'Bandung',
      province: 'Jawa Barat',
      postalCode: '40132',
      institution: 'Institut Teknologi Bandung',
      major: 'Teknik Elektro',
      studentId: '13518001',
      purpose: 'Proposal Penelitian',
    },
  })
  console.log(`   ✓ Profile for ${user3.name}`)

  await prisma.userProfile.create({
    data: {
      userId: user5.id,
      fullName: 'Rudi Hermawan',
      phone: '085678901234',
      address: 'Kampus ITS Sukolilo',
      city: 'Surabaya',
      province: 'Jawa Timur',
      postalCode: '60111',
      institution: 'Institut Teknologi Sepuluh Nopember',
      major: 'Sistem Informasi',
      studentId: '05111940000001',
      purpose: 'Tugas Akhir',
    },
  })
  console.log(`   ✓ Profile for ${user5.name}\n`)

  // ==================== PACKAGES ====================
  console.log('📦 Creating packages...')

  const packageProposal = await prisma.package.create({
    data: {
      code: 'PROPOSAL',
      name: 'Paket Proposal',
      description: 'Cocok untuk proposal skripsi dan tesis. Paket ini memberikan akses untuk memproses dokumen proposal Anda.',
      price: 50000,
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
  })
  console.log(`   ✓ ${packageProposal.name} - Rp ${packageProposal.price.toLocaleString('id-ID')}`)

  const packageHasil = await prisma.package.create({
    data: {
      code: 'HASIL',
      name: 'Paket Hasil',
      description: 'Paket paling populer untuk hasil penelitian. Ideal untuk mahasiswa yang sedang mengerjakan bab hasil dan pembahasan.',
      price: 75000,
      currency: 'IDR',
      features: [
        'Bypass dokumen hasil penelitian',
        'Maksimal 10 dokumen',
        'File size maksimal 15MB per dokumen',
        'Support format DOCX, PDF, dan ODT',
        'Hasil dalam 12 jam',
        'Priority support',
      ],
      maxDocuments: 10,
      maxFileSize: 15,
      validityDays: 30,
      isActive: true,
      order: 2,
    },
  })
  console.log(`   ✓ ${packageHasil.name} - Rp ${packageHasil.price.toLocaleString('id-ID')}`)

  const packageTutup = await prisma.package.create({
    data: {
      code: 'TUTUP',
      name: 'Paket Tutup (Complete)',
      description: 'Paket lengkap untuk semua kebutuhan. Dari proposal hingga penutup, semua terakomodir dalam satu paket.',
      price: 100000,
      currency: 'IDR',
      features: [
        'Bypass semua jenis dokumen',
        'Unlimited dokumen',
        'File size maksimal 20MB per dokumen',
        'Support semua format dokumen',
        'Hasil dalam 6 jam',
        'Priority support 24/7',
        'Revisi gratis jika diperlukan',
        'Konsultasi dengan expert',
      ],
      maxDocuments: 0, // unlimited
      maxFileSize: 20,
      validityDays: 60,
      isActive: true,
      order: 3,
    },
  })
  console.log(`   ✓ ${packageTutup.name} - Rp ${packageTutup.price.toLocaleString('id-ID')}\n`)

  // ==================== PAYMENT PROOFS ====================
  console.log('💳 Creating payment proofs...')

  // Payment 1 - User2 (Pending verification)
  const payment1 = await prisma.paymentProof.create({
    data: {
      userId: user2.id,
      packageId: packageHasil.id,
      paymentMethod: 'Transfer Bank BCA',
      accountName: 'Siti Permata',
      accountNumber: '1234567890',
      amount: packageHasil.price,
      proofImageUrl: '/uploads/payments/payment_user2_001.jpg',
      originalFilename: 'bukti_transfer_bca.jpg',
      fileSize: 2048000,
      transactionDate: new Date('2025-01-15T10:30:00'),
      notes: 'Transfer via mobile banking BCA',
      status: 'PENDING',
    },
  })
  console.log(`   ✓ Payment proof (PENDING) - ${user2.name}`)

  // Payment 2 - User3 (Verified - Active subscription)
  const payment2 = await prisma.paymentProof.create({
    data: {
      userId: user3.id,
      packageId: packageTutup.id,
      paymentMethod: 'Transfer Bank Mandiri',
      accountName: 'Budi Pratama',
      accountNumber: '0987654321',
      amount: packageTutup.price,
      proofImageUrl: '/uploads/payments/payment_user3_001.jpg',
      originalFilename: 'bukti_transfer_mandiri.jpg',
      fileSize: 1536000,
      transactionDate: new Date('2024-12-20T14:20:00'),
      notes: 'Transfer dari ATM Mandiri',
      status: 'VERIFIED',
      verifiedBy: admin.id,
      verifiedAt: new Date('2024-12-20T15:00:00'),
      adminNotes: 'Pembayaran valid, akun diaktifkan',
    },
  })
  console.log(`   ✓ Payment proof (VERIFIED) - ${user3.name}`)

  // Payment 3 - User5 (Verified - Expired subscription)
  const payment3 = await prisma.paymentProof.create({
    data: {
      userId: user5.id,
      packageId: packageProposal.id,
      paymentMethod: 'E-Wallet GoPay',
      accountName: 'Rudi Hermawan',
      accountNumber: '085678901234',
      amount: packageProposal.price,
      proofImageUrl: '/uploads/payments/payment_user5_001.jpg',
      originalFilename: 'bukti_gopay.jpg',
      fileSize: 1024000,
      transactionDate: new Date('2024-11-01T09:00:00'),
      notes: 'Pembayaran via GoPay',
      status: 'VERIFIED',
      verifiedBy: admin.id,
      verifiedAt: new Date('2024-11-01T10:00:00'),
      adminNotes: 'Pembayaran terverifikasi',
    },
  })
  console.log(`   ✓ Payment proof (VERIFIED) - ${user5.name}\n`)

  // ==================== SUBSCRIPTIONS ====================
  console.log('📅 Creating subscriptions...')

  // Subscription 1 - User2 (Pending - waiting for payment verification)
  await prisma.subscription.create({
    data: {
      userId: user2.id,
      packageId: packageHasil.id,
      paymentProofId: payment1.id,
      status: 'PENDING',
      isActive: false,
      documentsUsed: 0,
      autoRenew: false,
    },
  })
  console.log(`   ✓ Subscription (PENDING) - ${user2.name}`)

  // Subscription 2 - User3 (Active)
  const startDate = new Date('2024-12-20T15:00:00')
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + packageTutup.validityDays)

  await prisma.subscription.create({
    data: {
      userId: user3.id,
      packageId: packageTutup.id,
      paymentProofId: payment2.id,
      status: 'ACTIVE',
      isActive: true,
      startDate: startDate,
      endDate: endDate,
      documentsUsed: 3,
      autoRenew: false,
    },
  })
  console.log(`   ✓ Subscription (ACTIVE) - ${user3.name}`)

  // Subscription 3 - User5 (Expired)
  const expiredStartDate = new Date('2024-11-01T10:00:00')
  const expiredEndDate = new Date('2024-12-01T10:00:00')

  await prisma.subscription.create({
    data: {
      userId: user5.id,
      packageId: packageProposal.id,
      paymentProofId: payment3.id,
      status: 'EXPIRED',
      isActive: false,
      startDate: expiredStartDate,
      endDate: expiredEndDate,
      documentsUsed: 5,
      autoRenew: false,
    },
  })
  console.log(`   ✓ Subscription (EXPIRED) - ${user5.name}\n`)

  // ==================== STRATEGIES ====================
  console.log('🎯 Creating bypass strategies...')

  const strategies = [
    {
      name: 'header_focused',
      displayName: 'Header Bypass',
      description: 'Fokus pada modifikasi header dan metadata dokumen untuk menghindari deteksi',
      category: 'metadata',
      isActive: true,
      order: 1,
      defaultConfig: {
        modifyHeaders: true,
        modifyProperties: true,
        preserveFormatting: true,
      },
      capabilities: ['docx', 'pdf', 'odt'],
      usageCount: 245,
      successRate: 94.5,
      avgProcessingTime: 45,
    },
    {
      name: 'metadata_bypass',
      displayName: 'Metadata Cleaner',
      description: 'Membersihkan semua metadata yang bisa dideteksi sistem plagiarism',
      category: 'metadata',
      isActive: true,
      order: 2,
      defaultConfig: {
        removeAuthor: true,
        removeTimestamps: true,
        removeComments: true,
        removeRevisions: true,
      },
      capabilities: ['docx', 'pdf', 'odt', 'rtf'],
      usageCount: 189,
      successRate: 91.2,
      avgProcessingTime: 30,
    },
    {
      name: 'content_restructure',
      displayName: 'Content Restructure',
      description: 'Restrukturisasi konten dengan mempertahankan makna asli',
      category: 'content',
      isActive: true,
      order: 3,
      defaultConfig: {
        paraphraseLevel: 'medium',
        maintainFormatting: true,
        preserveReferences: true,
      },
      capabilities: ['docx', 'pdf'],
      usageCount: 156,
      successRate: 87.8,
      avgProcessingTime: 120,
    },
    {
      name: 'comprehensive',
      displayName: 'Comprehensive Bypass',
      description: 'Kombinasi semua teknik untuk hasil maksimal',
      category: 'advanced',
      isActive: true,
      order: 4,
      defaultConfig: {
        useAllMethods: true,
        aggressiveMode: false,
        qualityCheck: true,
      },
      capabilities: ['docx', 'pdf', 'odt'],
      usageCount: 312,
      successRate: 97.3,
      avgProcessingTime: 180,
    },
    {
      name: 'quick_clean',
      displayName: 'Quick Clean',
      description: 'Pembersihan cepat untuk dokumen sederhana',
      category: 'basic',
      isActive: true,
      order: 5,
      defaultConfig: {
        basicClean: true,
        fastMode: true,
      },
      capabilities: ['docx', 'pdf', 'odt', 'rtf', 'txt'],
      usageCount: 423,
      successRate: 82.1,
      avgProcessingTime: 15,
    },
  ]

  for (const strategy of strategies) {
    await prisma.strategy.create({ data: strategy })
    console.log(`   ✓ ${strategy.displayName}`)
  }
  console.log('')

  // ==================== DOCUMENTS ====================
  console.log('📄 Creating documents...')

  const doc1 = await prisma.document.create({
    data: {
      title: 'Proposal Penelitian - Implementasi AI',
      originalFilename: 'proposal_ai_research.docx',
      fileSize: 2048000,
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadPath: '/uploads/documents/user3_doc1.docx',
      userId: user3.id,
      status: 'COMPLETED',
      pageCount: 15,
      wordCount: 3500,
      characterCount: 21000,
    },
  })
  console.log(`   ✓ ${doc1.title}`)

  const doc2 = await prisma.document.create({
    data: {
      title: 'Bab III Metodologi Penelitian',
      originalFilename: 'bab3_metodologi.docx',
      fileSize: 1536000,
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadPath: '/uploads/documents/user3_doc2.docx',
      userId: user3.id,
      status: 'COMPLETED',
      pageCount: 12,
      wordCount: 2800,
      characterCount: 16800,
    },
  })
  console.log(`   ✓ ${doc2.title}`)

  const doc3 = await prisma.document.create({
    data: {
      title: 'Bab IV Hasil dan Pembahasan',
      originalFilename: 'bab4_hasil.docx',
      fileSize: 3072000,
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadPath: '/uploads/documents/user3_doc3.docx',
      userId: user3.id,
      status: 'ANALYZING',
      pageCount: 20,
      wordCount: 5200,
      characterCount: 31200,
    },
  })
  console.log(`   ✓ ${doc3.title}\n`)

  // ==================== DOCUMENT ANALYSIS ====================
  console.log('🔍 Creating document analysis...')

  await prisma.documentAnalysis.create({
    data: {
      documentId: doc1.id,
      flagCount: 8,
      flagTypes: [
        { type: 'metadata', count: 3 },
        { type: 'header', count: 2 },
        { type: 'timestamp', count: 3 },
      ],
      ocrText: 'Extracted text from document...',
      metadata: {
        author: 'Budi Pratama',
        created: '2024-12-15',
        modified: '2024-12-19',
      },
      similarityScore: 15.5,
      plagiarismReport: {
        sources: [],
        matchedPhrases: 3,
      },
    },
  })

  await prisma.documentAnalysis.create({
    data: {
      documentId: doc2.id,
      flagCount: 12,
      flagTypes: [
        { type: 'metadata', count: 4 },
        { type: 'header', count: 3 },
        { type: 'timestamp', count: 5 },
      ],
      ocrText: 'Metodologi penelitian extracted text...',
      metadata: {
        author: 'Budi Pratama',
        created: '2025-01-05',
        modified: '2025-01-10',
      },
      similarityScore: 22.3,
      plagiarismReport: {
        sources: ['journal.com'],
        matchedPhrases: 5,
      },
    },
  })
  console.log('   ✓ Analysis records created\n')

  // ==================== BYPASS HISTORY ====================
  console.log('🔄 Creating bypass history...')

  await prisma.bypassHistory.create({
    data: {
      documentId: doc1.id,
      userId: user3.id,
      strategy: 'comprehensive',
      status: 'COMPLETED',
      progress: 100,
      outputPath: '/uploads/bypassed/user3_doc1_bypassed.docx',
      outputFilename: 'proposal_ai_research_clean.docx',
      outputFileSize: 1945600,
      flagsRemoved: 8,
      processingTime: 165,
      successRate: 100.0,
      pythonApiResponse: {
        success: true,
        flags_detected: 8,
        flags_removed: 8,
      },
      configuration: {
        strategy: 'comprehensive',
        aggressiveMode: false,
      },
      completedAt: new Date('2024-12-20T16:30:00'),
    },
  })

  await prisma.bypassHistory.create({
    data: {
      documentId: doc2.id,
      userId: user3.id,
      strategy: 'header_focused',
      status: 'COMPLETED',
      progress: 100,
      outputPath: '/uploads/bypassed/user3_doc2_bypassed.docx',
      outputFilename: 'bab3_metodologi_clean.docx',
      outputFileSize: 1458432,
      flagsRemoved: 11,
      processingTime: 52,
      successRate: 91.7,
      pythonApiResponse: {
        success: true,
        flags_detected: 12,
        flags_removed: 11,
      },
      configuration: {
        strategy: 'header_focused',
        modifyHeaders: true,
      },
      completedAt: new Date('2025-01-11T10:15:00'),
    },
  })

  await prisma.bypassHistory.create({
    data: {
      documentId: doc3.id,
      userId: user3.id,
      strategy: 'comprehensive',
      status: 'PROCESSING',
      progress: 65,
      configuration: {
        strategy: 'comprehensive',
        aggressiveMode: false,
      },
    },
  })
  console.log('   ✓ Bypass history records created\n')

  // ==================== ACTIVITY LOGS ====================
  console.log('📝 Creating activity logs...')

  const activityLogs = [
    {
      userId: admin.id,
      action: 'USER_LOGIN',
      resource: 'auth',
      details: { loginMethod: 'email' },
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      createdAt: new Date('2025-01-20T09:00:00'),
    },
    {
      userId: user3.id,
      action: 'DOCUMENT_UPLOAD',
      resource: 'document',
      resourceId: doc1.id,
      details: { filename: doc1.originalFilename, size: doc1.fileSize },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      createdAt: new Date('2024-12-20T15:30:00'),
    },
    {
      userId: user3.id,
      action: 'BYPASS_START',
      resource: 'bypass',
      resourceId: doc1.id,
      details: { strategy: 'comprehensive' },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      createdAt: new Date('2024-12-20T16:00:00'),
    },
    {
      userId: user3.id,
      action: 'BYPASS_COMPLETE',
      resource: 'bypass',
      resourceId: doc1.id,
      details: { strategy: 'comprehensive', flagsRemoved: 8 },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      createdAt: new Date('2024-12-20T16:30:00'),
    },
    {
      userId: admin.id,
      action: 'PAYMENT_VERIFY',
      resource: 'payment',
      resourceId: payment2.id,
      details: { userId: user3.id, amount: packageTutup.price, status: 'VERIFIED' },
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
      createdAt: new Date('2024-12-20T15:00:00'),
    },
    {
      userId: user2.id,
      action: 'PAYMENT_UPLOAD',
      resource: 'payment',
      resourceId: payment1.id,
      details: { packageId: packageHasil.id, amount: packageHasil.price },
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0',
      createdAt: new Date('2025-01-15T10:30:00'),
    },
  ]

  await prisma.activityLog.createMany({ data: activityLogs })
  console.log(`   ✓ ${activityLogs.length} activity log records created\n`)

  // ==================== SYSTEM STATS ====================
  console.log('📊 Creating system statistics...')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  await prisma.systemStats.create({
    data: {
      date: today,
      totalDocuments: 3,
      totalBypasses: 3,
      totalUsers: 5,
      successfulBypasses: 2,
      failedBypasses: 0,
      avgProcessingTime: 108, // (165 + 52) / 2
      totalStorageUsed: BigInt(15360000),
      totalDocumentsSize: BigInt(6656000),
      pythonApiCalls: 5,
      pythonApiErrors: 0,
    },
  })
  console.log('   ✓ System statistics created\n')

  // ==================== SUMMARY ====================
  console.log('✨ Database seed completed successfully!\n')
  console.log('📊 Summary:')
  console.log(`   • Users: 5 (1 Admin, 4 Users)`)
  console.log(`   • Packages: 3 (Proposal, Hasil, Tutup)`)
  console.log(`   • Payment Proofs: 3`)
  console.log(`   • Subscriptions: 3 (1 Pending, 1 Active, 1 Expired)`)
  console.log(`   • Documents: 3`)
  console.log(`   • Bypass Strategies: 5`)
  console.log(`   • Bypass History: 3`)
  console.log(`   • Activity Logs: 6`)
  console.log(`   • System Stats: 1\n`)

  console.log('🔐 Login Credentials:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('👨‍💼 Admin Account:')
  console.log('   Email: admin@rumahplagiasi.com')
  console.log('   Password: admin123')
  console.log('   Status: ACTIVE (Full access)')
  console.log('   ')
  console.log('👥 Test User Accounts:')
  console.log('   ')
  console.log('   1. Budi Pratama (ACTIVE - Has subscription)')
  console.log('      Email: budi.pratama@student.itb.ac.id')
  console.log('      Password: password123')
  console.log('      Status: ACTIVE with Paket Tutup')
  console.log('      Has 3 documents processed')
  console.log('   ')
  console.log('   2. Siti Permata (PENDING_VERIFICATION)')
  console.log('      Email: siti.permata@student.ugm.ac.id')
  console.log('      Password: password123')
  console.log('      Status: Payment uploaded, waiting for admin verification')
  console.log('   ')
  console.log('   3. Andi Saputra (PENDING_PAYMENT)')
  console.log('      Email: andi.saputra@student.ui.ac.id')
  console.log('      Password: password123')
  console.log('      Status: Profile completed, need to upload payment')
  console.log('   ')
  console.log('   4. Maya Dewi (PENDING_PROFILE)')
  console.log('      Email: maya.dewi@student.unair.ac.id')
  console.log('      Password: password123')
  console.log('      Status: New user, need to complete profile')
  console.log('   ')
  console.log('   5. Rudi Hermawan (EXPIRED)')
  console.log('      Email: rudi.hermawan@student.its.ac.id')
  console.log('      Password: password123')
  console.log('      Status: Subscription expired')
  console.log('   ')
  console.log('📦 Available Packages:')
  console.log('   1. PROPOSAL - Rp 50.000')
  console.log('      • 5 documents, 30 days validity')
  console.log('      • Max 10MB per file')
  console.log('   ')
  console.log('   2. HASIL - Rp 75.000 (POPULAR)')
  console.log('      • 10 documents, 30 days validity')
  console.log('      • Max 15MB per file')
  console.log('      • Priority support')
  console.log('   ')
  console.log('   3. TUTUP - Rp 100.000')
  console.log('      • Unlimited documents, 60 days validity')
  console.log('      • Max 20MB per file')
  console.log('      • Priority 24/7 support')
  console.log('      • Free consultation')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
