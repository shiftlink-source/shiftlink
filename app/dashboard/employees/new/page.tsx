'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewEmployeePage() {
  const [name, setName] = useState('')
  const [nameKana, setNameKana] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [employmentType, setEmploymentType] = useState('part_time')
  const [hourlyWage, setHourlyWage] = useState('')
  const [targetMonthlyIncome, setTargetMonthlyIncome] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 店舗情報取得
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

    // 従業員コード生成
    const { data: countData } = await supabase
      .from('employees')
      .select('id', { count: 'exact' })
      .eq('store_id', store.id)

    const count = countData?.length || 0
    const employeeCode = `E${String(count + 1).padStart(3, '0')}`

    // 従業員登録
    const { error: insertError } = await supabase
      .from('employees')
      .insert({
        store_id: store.id,
        employee_code: employeeCode,
        name,
        name_kana: nameKana || null,
        phone: phone || null,
        email: email || null,
        employment_type: employmentType,
        hourly_wage: hourlyWage ? parseInt(hourlyWage) : 0,
        target_monthly_income: targetMonthlyIncome ? parseInt(targetMonthlyIncome) : 0,
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard/employees')
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/dashboard/employees" className="text-blue-600 hover:underline text-sm">
          ← 従業員一覧に戻る
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">従業員を追加</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="山田太郎"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                フリガナ
              </label>
              <input
                type="text"
                value={nameKana}
                onChange={(e) => setNameKana(e.target.value)}
                placeholder="ヤマダタロウ"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                電話番号
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="090-1234-5678"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                メールアドレス
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yamada@example.com"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              雇用形態 <span className="text-red-500">*</span>
            </label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="part_time">パート・アルバイト</option>
              <option value="full_time">正社員</option>
              <option value="contract">契約社員</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                時給
              </label>
              <div className="mt-1 relative">
                <span className="absolute left-3 top-2 text-gray-500">¥</span>
                <input
                  type="number"
                  value={hourlyWage}
                  onChange={(e) => setHourlyWage(e.target.value)}
                  placeholder="1200"
                  className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                希望月収
              </label>
              <div className="mt-1 relative">
                <span className="absolute left-3 top-2 text-gray-500">¥</span>
                <input
                  type="number"
                  value={targetMonthlyIncome}
                  onChange={(e) => setTargetMonthlyIncome(e.target.value)}
                  placeholder="150000"
                  className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
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
              href="/dashboard/employees"
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