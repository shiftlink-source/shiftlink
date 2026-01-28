import { createClient } from '@/lib/supabase/server'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { ja } from 'date-fns/locale'
import Link from 'next/link'

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: { month?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_email', user?.email)
    .single()

  const currentMonth = searchParams.month 
    ? new Date(searchParams.month + '-01') 
    : new Date()
  
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)

  // 勤怠データ取得
  const { data: attendances } = await supabase
    .from('attendances')
    .select('*, employees(name, employee_code)')
    .eq('store_id', store?.id)
    .gte('work_date', format(monthStart, 'yyyy-MM-dd'))
    .lte('work_date', format(monthEnd, 'yyyy-MM-dd'))
    .order('work_date', { ascending: false })

  const prevMonth = format(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)), 'yyyy-MM')
  const nextMonth = format(new Date(currentMonth.setMonth(currentMonth.getMonth() + 2)), 'yyyy-MM')

  // 時間フォーマット
  const formatTime = (datetime: string | null) => {
    if (!datetime) return '-'
    return format(new Date(datetime), 'HH:mm')
  }

  // 勤務時間計算
  const calcWorkHours = (minutes: number | null) => {
    if (!minutes) return '-'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}時間${mins > 0 ? `${mins}分` : ''}`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">勤怠管理</h1>
      </div>

      {/* 月選択 */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <Link
          href={`/dashboard/attendance?month=${prevMonth}`}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          ←
        </Link>
        <h2 className="text-xl font-bold text-gray-900">
          {format(monthStart, 'yyyy年 M月', { locale: ja })}
        </h2>
        <Link
          href={`/dashboard/attendance?month=${nextMonth}`}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          →
        </Link>
      </div>

      {/* 勤怠一覧 */}
      {attendances && attendances.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">日付</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">従業員</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">出勤</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">退勤</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">休憩</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">実働</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">ステータス</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {attendances.map((attendance) => (
                <tr key={attendance.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {format(new Date(attendance.work_date), 'M/d (E)', { locale: ja })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {attendance.employees?.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatTime(attendance.clock_in)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatTime(attendance.clock_out)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {attendance.break_minutes ? `${attendance.break_minutes}分` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {calcWorkHours(attendance.actual_minutes)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {attendance.status === 'completed' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        完了
                      </span>
                    )}
                    {attendance.status === 'pending' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        勤務中
                      </span>
                    )}
                    {attendance.status === 'approved' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        承認済
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500">この月の勤怠データはありません</p>
        </div>
      )}
    </div>
  )
}