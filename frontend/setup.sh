#!/bin/bash
# Frontend Setup Script
# Created by devnolife

echo "╔═══════════════════════════════════════════════╗"
echo "║   🚀 Anti-Plagiasi Frontend Setup 🚀         ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""
echo "⚡ Created by devnolife"
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "📝 Setting up environment..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file. Please edit it with your credentials."
else
    echo "⚠️  .env file already exists. Skipping..."
fi

echo ""
echo "🗄️  Setting up database..."
echo "⚠️  Make sure PostgreSQL is running!"
read -p "Press Enter to continue..."

npx prisma generate
npx prisma db push

echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║            ✅ Setup Complete! ✅              ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. Edit .env file with your database credentials"
echo "  2. Run: npm run dev"
echo "  3. Open: http://localhost:3000"
echo ""
echo "⚡ Made with ❤️  by devnolife"
