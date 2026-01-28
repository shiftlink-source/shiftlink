'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  Wallet,
  Settings,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const menuItems = [
  { href: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/dashboard/employees', label: '従業員管理', icon: Users },
  { href: '/dashboard/shifts', label: 'シフト管理', icon: Calendar },
  { href: '/dashboard/attendance', label: '勤怠管理', icon: Clock },
  { href: '/dashboard/payroll', label: '給与管理', icon: Wallet },
  { href: '/dashboard/settings', label: '設定', icon: Settings },
]

export default function Sidebar({ store }: { store: any }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">ShiftLink</h1>
        <p className="text-sm text-gray-500 mt-1">{store?.name}</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-600 hover:bg-gray-50 rounded-lg"
        >
          <LogOut size={20} />
          <span>ログアウト</span>
        </button>
      </div>
    </aside>
  )
}