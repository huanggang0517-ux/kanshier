import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getSessionUser, unauth } from '@/lib/session'

export async function POST(req) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

    const user = await getSessionUser()
    if (!user) return unauth()

    const { method } = await req.json()
    if (!method) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }

    if (user.is_vip) return NextResponse.json({ error: '你已经是年卡会员了' }, { status: 400 })

    const { error } = await supabase
      .from('readings')
      .insert({
        user_id: user.id,
        service_type: 'vip_payment',
        input_data: { method, status: 'pending' }
      })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('vip apply error:', err)
    return NextResponse.json({ error: '提交失败，请重试' }, { status: 500 })
  }
}
