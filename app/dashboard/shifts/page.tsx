import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'
import { ja } from 'date-fns/locale'
import ShiftCalendar from '@/components/shifts/ShiftCalendar'

export default async function ShiftsPage({
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

  const { data: shifts } = await supabase
    .from('shifts')
    .select('*, employees(name)')
    .eq('store_id', store?.id)
    .gte('work_date', format(monthStart, 'yyyy-MM-dd'))
    .lte('work_date', format(monthEnd, 'yyyy-MM-dd'))
    .order('work_date', { ascending: true })

  const prevMonth = format(subMonths(currentMonth, 1), 'yyyy-MM')
  const nextMonth = format(addMonths(currentMonth, 1), 'yyyy-MM')

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">シフト管理</h1>
        <Link
          href="/dashboard/shifts/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + シフトを追加
        </Link>
      </div>

      <div className="flex items-center justify-center gap-4 mb-6">
        <Link
          href={`/dashboard/shifts?month=${prevMonth}`}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          ←
        </Link>
        <h2 className="text-xl font-bold text-gray-900">
          {format(currentMonth, 'yyyy年 M月', { locale: ja })}
        </h2>
        <Link
          href={`/dashboard/shifts?month=${nextMonth}`}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          →
        </Link>
      </div>

      <ShiftCalendar 
        currentMonth={currentMonth}
        shifts={shifts || []}
      />

      <div className="mt-6 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded"></span>
          <span className="text-gray-600">希望提出</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-green-100 border border-green-300 rounded"></span>
          <span className="text-gray-600">確定</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 bg-red-100 border border-red-300 rounded"></span>
          <span className="text-gray-600">人員不足</span>
        </div>
      </div>
    </div>
  )
}