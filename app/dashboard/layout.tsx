import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_email', user.email)
    .single()

  return (
    <div className="min-h-screen flex">
      <Sidebar store={store} />
      <main className="flex-1 p-8 bg-gray-50">
        {children}
      </main>
    </div>
  )
}