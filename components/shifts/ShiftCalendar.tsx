'use client'

import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday } from 'date-fns'
import Link from 'next/link'

type Shift = {
  id: string
  work_date: string
  start_time: string
  end_time: string
  status: string
  employees: { name: string } | null
}

type Props = {
  currentMonth: Date
  shifts: Shift[]
}

const dayNames = ['日', '月', '火', '水', '木', '金', '土']

export default function ShiftCalendar({ currentMonth, shifts }: Props) {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  const startDayOfWeek = getDay(monthStart)

  const shiftsByDate: { [key: string]: Shift[] } = {}
  shifts.forEach(shift => {
    const dateKey = shift.work_date
    if (!shiftsByDate[dateKey]) {
      shiftsByDate[dateKey] = []
    }
    shiftsByDate[dateKey].push(shift)
  })

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
        {dayNames.map((day, index) => (
          <div
            key={day}
            className={`py-3 text-center text-sm font-medium ${
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-600'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {Array.from({ length: startDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="h-32 border-b border-r border-gray-100 bg-gray-50" />
        ))}

        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const dayShifts = shiftsByDate[dateKey] || []
          const dayOfWeek = getDay(day)

          return (
            <Link
              key={dateKey}
              href={`/dashboard/shifts/day/${dateKey}`}
              className={`h-32 border-b border-r border-gray-100 p-2 hover:bg-blue-50 transition-colors ${
                isToday(day) ? 'bg-blue-50' : ''
              }`}
            >
              <div className={`text-sm font-medium mb-1 ${
                dayOfWeek === 0 ? 'text-red-500' : dayOfWeek === 6 ? 'text-blue-500' : 'text-gray-900'
              }`}>
                {format(day, 'd')}
              </div>
              
              <div className="space-y-1">
                {dayShifts.slice(0, 3).map((shift) => (
                  <div
                    key={shift.id}
                    className={`text-xs px-1 py-0.5 rounded truncate ${
                      shift.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : shift.status === 'requested'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {shift.employees?.name} {shift.start_time?.slice(0, 5)}
                  </div>
                ))}
                {dayShifts.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{dayShifts.length - 3}件
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}