import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">ShiftLink</h1>
          <div className="space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              ログイン
            </Link>
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              無料で始める
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            シフト管理を
            <span className="text-blue-600">もっとシンプルに</span>
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            LINE連携でシフト提出・勤怠管理・給与計算をワンストップで。
            <br />
            飲食店・美容院・サービス業に特化したシフト管理システム。
          </p>
          <Link
            href="/signup"
            className="inline-block bg-blue-600 text-white text-lg px-8 py-4 rounded-lg hover:bg-blue-700 shadow-lg"
          >
            無料で始める
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">LINEでシフト提出</h3>
            <p className="text-gray-600">従業員はLINEから簡単にシフト希望を提出。アプリのダウンロード不要。</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">希望月収から逆算</h3>
            <p className="text-gray-600">「月15万稼ぎたい」→ 必要なシフト数を自動計算。従業員のモチベーションUP。</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">給与計算まで一気通貫</h3>
            <p className="text-gray-600">勤怠データから給与を自動計算。明細もLINEで送信。</p>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-10 text-center text-gray-500">
        <p>© 2025 ShiftLink. All rights reserved.</p>
      </footer>
    </div>
  )
}