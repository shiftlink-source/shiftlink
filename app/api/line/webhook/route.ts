import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'

// Supabaseクライアント（anon keyを使用）
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    throw new Error('Supabase credentials not configured')
  }
  
  return createClient(url, key)
}

const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || ''
const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || ''

// 署名検証
function verifySignature(body: string, signature: string): boolean {
  if (!LINE_CHANNEL_SECRET) return true
  const hash = createHmac('sha256', LINE_CHANNEL_SECRET)
    .update(body)
    .digest('base64')
  return hash === signature
}

// 型定義
type LineMessage = {
  type: string
  text: string
}

type LineEvent = {
  type: string
  source: { userId: string }
  replyToken: string
  message?: { type: string; text: string }
}

type Employee = {
  id: string
  name: string
  store_id: string
  stores?: { name: string } | null
}

type Attendance = {
  id: string
  clock_in: string | null
  clock_out: string | null
  break_minutes: number | null
}

type Shift = {
  work_date: string
  start_time: string | null
  end_time: string | null
}

// LINEにメッセージ送信
async function replyMessage(replyToken: string, messages: LineMessage[]) {
  console.log('Attempting to reply:', { replyToken, messages })
  
  if (!LINE_CHANNEL_ACCESS_TOKEN) {
    console.error('LINE_CHANNEL_ACCESS_TOKEN is missing!')
    return
  }
  
  try {
    const response = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ replyToken, messages }),
    })
    
    const result = await response.text()
    console.log('LINE API response:', response.status, result)
  } catch (error) {
    console.error('LINE API error:', error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-line-signature') || ''

    if (!verifySignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const parsed = JSON.parse(body)
    const events = parsed.events || []

    for (const event of events) {
      await handleEvent(event)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ success: true })
  }
}

async function handleEvent(event: LineEvent) {
  const { type, source, replyToken, message } = event
  const lineUserId = source.userId

  if (type === 'follow') {
    await handleFollow(lineUserId, replyToken)
  } else if (type === 'message' && message?.type === 'text') {
    await handleMessage(lineUserId, message.text, replyToken)
  }
}

async function handleFollow(lineUserId: string, replyToken: string) {
  const supabase = getSupabase()
  
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('line_user_id', lineUserId)
    .single()

  if (employee) {
    await replyMessage(replyToken, [
      {
        type: 'text',
        text: `${employee.name}さん、おかえりなさい！\n\n【使い方】\n・「出勤」→ 出勤打刻\n・「退勤」→ 退勤打刻\n・「シフト」→ シフト確認`,
      },
    ])
  } else {
    await replyMessage(replyToken, [
      {
        type: 'text',
        text: `ShiftLinkへようこそ！\n\n従業員登録を行うには、店舗から発行された「従業員コード」を入力してください。\n\n例: E001`,
      },
    ])
  }
}

async function handleMessage(lineUserId: string, text: string, replyToken: string) {
  const supabase = getSupabase()
  const lowerText = text.toLowerCase().trim()

  const { data: employee } = await supabase
    .from('employees')
    .select('*, stores(name)')
    .eq('line_user_id', lineUserId)
    .single()

  if (employee) {
    if (lowerText === '出勤' || lowerText === 'in') {
      await handleClockIn(employee as Employee, replyToken)
    } else if (lowerText === '退勤' || lowerText === 'out') {
      await handleClockOut(employee as Employee, replyToken)
    } else if (lowerText === 'シフト' || lowerText === 'shift') {
      await handleShiftCheck(employee as Employee, replyToken)
    } else if (lowerText === 'ヘルプ' || lowerText === 'help') {
      await replyMessage(replyToken, [
        {
          type: 'text',
          text: `【コマンド一覧】\n・出勤 → 出勤打刻\n・退勤 → 退勤打刻\n・シフト → 今週のシフト確認`,
        },
      ])
    } else {
      await replyMessage(replyToken, [
        {
          type: 'text',
          text: `「ヘルプ」と送信するとコマンド一覧が見れます。`,
        },
      ])
    }
  } else {
    await handleLinking(lineUserId, text, replyToken)
  }
}

async function handleClockIn(employee: Employee, replyToken: string) {
  const supabase = getSupabase()
  const today = new Date().toISOString().split('T')[0]
  const now = new Date().toISOString()

  const { data: existing } = await supabase
    .from('attendances')
    .select('*')
    .eq('employee_id', employee.id)
    .eq('work_date', today)
    .single()

  const attendance = existing as Attendance | null

  if (attendance && attendance.clock_in) {
    const clockInTime = new Date(attendance.clock_in).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Tokyo',
    })
    await replyMessage(replyToken, [
      {
        type: 'text',
        text: `本日は既に出勤打刻済みです。\n出勤時刻: ${clockInTime}`,
      },
    ])
    return
  }

  if (attendance) {
    await supabase
      .from('attendances')
      .update({ clock_in: now })
      .eq('id', attendance.id)
  } else {
    await supabase.from('attendances').insert({
      store_id: employee.store_id,
      employee_id: employee.id,
      work_date: today,
      clock_in: now,
      status: 'pending',
    })
  }

  const clockInTime = new Date(now).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tokyo',
  })

  await replyMessage(replyToken, [
    {
      type: 'text',
      text: `出勤打刻しました✓\n${clockInTime}\n\n${employee.name}さん、今日もよろしくお願いします！`,
    },
  ])
}

async function handleClockOut(employee: Employee, replyToken: string) {
  const supabase = getSupabase()
  const today = new Date().toISOString().split('T')[0]
  const now = new Date().toISOString()

  const { data: existing } = await supabase
    .from('attendances')
    .select('*')
    .eq('employee_id', employee.id)
    .eq('work_date', today)
    .single()

  const attendance = existing as Attendance | null

  if (!attendance || !attendance.clock_in) {
    await replyMessage(replyToken, [
      {
        type: 'text',
        text: `本日の出勤打刻がありません。\n先に「出勤」と送信してください。`,
      },
    ])
    return
  }

  if (attendance.clock_out) {
    const clockOutTime = new Date(attendance.clock_out).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Tokyo',
    })
    await replyMessage(replyToken, [
      {
        type: 'text',
        text: `本日は既に退勤打刻済みです。\n退勤時刻: ${clockOutTime}`,
      },
    ])
    return
  }

  const clockIn = new Date(attendance.clock_in)
  const clockOut = new Date(now)
  const actualMinutes = Math.floor((clockOut.getTime() - clockIn.getTime()) / 60000) - (attendance.break_minutes || 0)

  await supabase
    .from('attendances')
    .update({
      clock_out: now,
      actual_minutes: actualMinutes,
      status: 'completed',
    })
    .eq('id', attendance.id)

  const hours = Math.floor(actualMinutes / 60)
  const minutes = actualMinutes % 60

  const clockOutTime = new Date(now).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tokyo',
  })

  await replyMessage(replyToken, [
    {
      type: 'text',
      text: `退勤打刻しました✓\n${clockOutTime}\n\n本日の勤務時間: ${hours}時間${minutes > 0 ? `${minutes}分` : ''}\n\nお疲れ様でした！`,
    },
  ])
}

async function handleShiftCheck(employee: Employee, replyToken: string) {
  const supabase = getSupabase()
  const today = new Date()
  const weekEnd = new Date(today)
  weekEnd.setDate(today.getDate() + 7)

  const { data: shifts } = await supabase
    .from('shifts')
    .select('*')
    .eq('employee_id', employee.id)
    .eq('status', 'approved')
    .gte('work_date', today.toISOString().split('T')[0])
    .lte('work_date', weekEnd.toISOString().split('T')[0])
    .order('work_date', { ascending: true })

  if (!shifts || shifts.length === 0) {
    await replyMessage(replyToken, [
      {
        type: 'text',
        text: `今後1週間の確定シフトはありません。`,
      },
    ])
    return
  }

  const shiftList = (shifts as Shift[]).map((s) => {
    const date = new Date(s.work_date)
    const dayNames = ['日', '月', '火', '水', '木', '金', '土']
    const dayName = dayNames[date.getDay()]
    return `${date.getMonth() + 1}/${date.getDate()}(${dayName}) ${s.start_time?.slice(0, 5)}-${s.end_time?.slice(0, 5)}`
  }).join('\n')

  await replyMessage(replyToken, [
    {
      type: 'text',
      text: `📅 今後1週間のシフト\n\n${shiftList}`,
    },
  ])
}

async function handleLinking(lineUserId: string, text: string, replyToken: string) {
  const supabase = getSupabase()
  const code = text.trim().toUpperCase()

  const { data: employee } = await supabase
    .from('employees')
    .select('*, stores(name)')
    .eq('employee_code', code)
    .is('line_user_id', null)
    .single()

  const emp = employee as Employee | null

  if (emp) {
    await supabase
      .from('employees')
      .update({
        line_user_id: lineUserId,
        line_linked_at: new Date().toISOString(),
      })
      .eq('id', emp.id)

    await supabase.from('line_link_history').insert({
      employee_id: emp.id,
      line_user_id: lineUserId,
    })

    await replyMessage(replyToken, [
      {
        type: 'text',
        text: `${emp.name}さん、LINE連携が完了しました！\n\n店舗: ${emp.stores?.name}\n\n【使い方】\n・出勤 → 出勤打刻\n・退勤 → 退勤打刻\n・シフト → シフト確認`,
      },
    ])
  } else {
    await replyMessage(replyToken, [
      {
        type: 'text',
        text: `従業員コードが見つかりませんでした。\n\n店舗から発行された正しい従業員コードを入力してください。\n\n例: E001`,
      },
    ])
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok' })
}