import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_email', user?.email)
    .single()

  const { count: employeeCount } = await supabase
    .from('employees')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', store?.id)
    .eq('status', 'active')

  const { count: pendingShiftCount } = await supabase
    .from('shifts')
    .select('*', { count: 'exact', head: true })
    .eq('store_id', store?.id)
    .eq('status', 'requested')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">ダッシュボード</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm mb-2">従業員数</p>
          <p className="text-3xl font-bold text-gray-900">
            {employeeCount || 0}
            <span className="text-lg text-gray-500 ml-1">人</span>
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm mb-2">未確定シフト</p>
          <p className="text-3xl font-bold text-yellow-600">
            {pendingShiftCount || 0}
            <span className="text-lg text-gray-500 ml-1">件</span>
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm mb-2">今月の人件費</p>
          <p className="text-3xl font-bold text-gray-900">
            ¥0
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">クイックアクション</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/dashboard/employees"
            className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-2xl mb-2">👤</span>
            <span className="text-sm text-gray-600">従業員を追加</span>
          </Link>
          <Link
            href="/dashboard/shifts"
            className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-2xl mb-2">📅</span>
            <span className="text-sm text-gray-600">シフトを確認</span>
          </Link>
          <Link
            href="/dashboard/attendance"
            className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-2xl mb-2">⏰</span>
            <span className="text-sm text-gray-600">勤怠を確認</span>
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="text-2xl mb-2">💬</span>
            <span className="text-sm text-gray-600">LINE連携</span>
          </Link>
        </div>
      </div>
    </div>
  )
}