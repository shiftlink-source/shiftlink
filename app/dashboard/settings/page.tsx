import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_email', user?.email)
    .single()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">設定</h1>

      {/* 店舗情報 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">店舗情報</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">店舗名</label>
            <p className="text-gray-900">{store?.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">オーナー名</label>
            <p className="text-gray-900">{store?.owner_name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">メールアドレス</label>
            <p className="text-gray-900">{store?.owner_email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">電話番号</label>
            <p className="text-gray-900">{store?.phone || '未設定'}</p>
          </div>
        </div>
      </div>

      {/* LINE連携 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">LINE連携</h2>
        
        {store?.line_channel_id ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                連携済み
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Channel ID</label>
              <p className="text-gray-900">{store.line_channel_id}</p>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-gray-500 mb-4">
              LINE公式アカウントと連携すると、従業員がLINEからシフト提出や打刻ができるようになります。
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">連携手順</h3>
              <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                <li>LINE Developersでチャネルを作成</li>
                <li>Messaging APIを有効化</li>
                <li>チャネルID、チャネルシークレット、アクセストークンを取得</li>
                <li>下記フォームに入力して保存</li>
              </ol>
            </div>
            
            <form className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Channel ID
                </label>
                <input
                  type="text"
                  placeholder="1234567890"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Channel Secret
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••••••"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Channel Access Token
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••••••"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                LINE連携を保存
              </button>
            </form>
          </div>
        )}
      </div>

      {/* シフト設定 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">シフト設定</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              シフト提出サイクル
            </label>
            <select className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="weekly">毎週</option>
              <option value="biweekly">隔週</option>
              <option value="monthly">毎月</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              提出締切（何日前）
            </label>
            <input
              type="number"
              defaultValue={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="button"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            設定を保存
          </button>
        </div>
      </div>
    </div>
  )
}