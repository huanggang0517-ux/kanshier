import { getSupabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(req) {
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('user_id')

  if (!userId) {
    return NextResponse.json({ error: '缺少参数' }, { status: 400 })
  }

  const { data: user } = await supabase
    .from('users')
    .select('id, phone, free_count, is_vip, vip_expiry, invite_code')
    .eq('id', userId)
    .single()

  if (!user) {
    return NextResponse.json({ error: '用户不存在' }, { status: 404 })
  }

  return NextResponse.json({ user })
}
