'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Employee = {
  id: string
  name: string
  employee_code: string
}

export default function NewShiftPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeeId, setEmployeeId] = useState('')
  const [workDate, setWorkDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [breakMinutes, setBreakMinutes] = useState('60')
  const [status, setStatus] = useState('approved')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: store } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_email', user?.email)
        .single()

      if (store) {
        const { data } = await supabase
          .from('employees')
          .select('id, name, employee_code')
          .eq('store_id', store.id)
          .eq('status', 'active')

        setEmployees(data || [])
      }
    }
    fetchEmployees()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('owner_email', user?.email)
      .single()

    if (!store) {
      setError('店舗情報が見つかりません')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase
      .from('shifts')
      .insert({
        store_id: store.id,
        employee_id: employeeId,
        work_date: workDate,
        start_time: startTime,
        end_time: endTime,
        break_minutes: parseInt(breakMinutes),
        status,
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard/shifts')
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/dashboard/shifts" className="text-blue-600 hover:underline text-sm">
          ← シフト管理に戻る
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">シフトを追加</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              従業員 <span className="text-red-500">*</span>
            </label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">選択してください</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.employee_code} - {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              日付 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                開始時間 <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                終了時間 <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              休憩時間（分）
            </label>
            <input
              type="number"
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              ステータス
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="requested">希望提出</option>
              <option value="approved">確定</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登録中...' : '登録する'}
            </button>
            <Link
              href="/dashboard/shifts"
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 text-center"
            >
              キャンセル
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}