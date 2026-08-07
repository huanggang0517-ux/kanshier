import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getSessionUser, unauth } from '@/lib/session'

export async function POST(req) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

    const user = await getSessionUser()
    if (!user) return unauth()

    const { readingId } = await req.json()
    if (!readingId) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }

    const now = new Date().toISOString()

    const { data: reading } = await supabase
      .from('readings')
      .select('input_data')
      .eq('id', readingId)
      .eq('user_id', user.id)
      .single()

    if (!reading) return NextResponse.json({ error: '信件不存在' }, { status: 404 })

    // 未到期不可提前打开
    const fd = reading.input_data?.futureDate
    const today = new Date().toISOString().split('T')[0]
    if (fd && fd > today) {
      return NextResponse.json({ error: '时光未至 · 尚不能开启这封信' }, { status: 403 })
    }

    await supabase
      .from('readings')
      .update({ input_data: { ...reading.input_data, delivered_at: now } })
      .eq('id', readingId)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('letter open error:', err)
    return NextResponse.json({ error: '服务器繁忙' }, { status: 500 })
  }
}
