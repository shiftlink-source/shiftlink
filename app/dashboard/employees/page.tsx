import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function EmployeesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_email', user?.email)
    .single()

  const { data: employees } = await supabase
    .from('employees')
    .select('*')
    .eq('store_id', store?.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">従業員管理</h1>
        <Link
          href="/dashboard/employees/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + 従業員を追加
        </Link>
      </div>

      {employees && employees.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">従業員コード</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">名前</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">雇用形態</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">時給</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">希望月収</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">LINE連携</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{employee.employee_code}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{employee.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {employee.employment_type === 'full_time' && '正社員'}
                    {employee.employment_type === 'part_time' && 'パート・アルバイト'}
                    {employee.employment_type === 'contract' && '契約社員'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {employee.hourly_wage ? `¥${employee.hourly_wage.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {employee.target_monthly_income ? `¥${employee.target_monthly_income.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {employee.line_user_id ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        連携済
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        未連携
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Link
                      href={`/dashboard/employees/${employee.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      編集
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-gray-500 mb-4">従業員がまだ登録されていません</p>
          <Link
            href="/dashboard/employees/new"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            最初の従業員を追加
          </Link>
        </div>
      )}
    </div>
  )
}