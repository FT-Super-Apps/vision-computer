import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            ANTI-PLAGIASI
          </h1>
          <p className="text-2xl text-gray-600 mb-8">
            Document Bypass System v2.1.0
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              🚀 Go to Dashboard
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold"
            >
              🔐 Login
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-bold mb-2">Document Management</h3>
              <p className="text-gray-600">Upload and manage your documents with ease</p>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-4xl mb-4">🔥</div>
              <h3 className="text-lg font-bold mb-2">Smart Bypass</h3>
              <p className="text-gray-600">AI-powered bypass with multiple strategies</p>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-bold mb-2">Analytics</h3>
              <p className="text-gray-600">Track your usage and success rates</p>
            </div>
          </div>

          <div className="mt-12 text-gray-500">
            <p>⚡ Crafted with passion by <span className="font-bold text-indigo-600">devnolife</span></p>
          </div>
        </div>
      </div>
    </main>
  )
}
