import { getSupabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

const ADMIN_PHONE = '17614130826'

async function isAdmin(supabase, userId) {
  if (!userId) return false
  const { data } = await supabase.from('users').select('phone').eq('id', userId).single()
  return data?.phone === ADMIN_PHONE
}

export async function GET(req) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

    const { searchParams } = new URL(req.url)
    const adminId = searchParams.get('adminId')
    if (!(await isAdmin(supabase, adminId))) {
      return NextResponse.json({ error: '无权限' }, { status: 403 })
    }

    const { data: users } = await supabase
      .from('users')
      .select('id, phone, free_count, is_vip, vip_expiry, invite_code, created_at')
      .order('created_at', { ascending: false })

    return NextResponse.json({ users: users || [] })
  } catch (err) {
    console.error('admin list error:', err)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

    const { userId, action, adminId } = await req.json()
    if (!userId || !action) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }
    if (!(await isAdmin(supabase, adminId))) {
      return NextResponse.json({ error: '无权限' }, { status: 403 })
    }

    if (action === 'set_vip') {
      const expiry = new Date()
      expiry.setFullYear(expiry.getFullYear() + 1)

      await supabase
        .from('users')
        .update({ is_vip: true, vip_expiry: expiry.toISOString(), free_count: 999 })
        .eq('id', userId)

      return NextResponse.json({ success: true, message: '已开通年卡会员' })
    }

    if (action === 'remove_vip') {
      await supabase
        .from('users')
        .update({ is_vip: false, vip_expiry: null, free_count: 0 })
        .eq('id', userId)

      return NextResponse.json({ success: true, message: '已取消年卡会员' })
    }

    if (action === 'add_count') {
      const { data: user } = await supabase
        .from('users')
        .select('free_count')
        .eq('id', userId)
        .single()

      await supabase
        .from('users')
        .update({ free_count: (user?.free_count || 0) + 1 })
        .eq('id', userId)

      return NextResponse.json({ success: true, message: '已增加1次免费次数' })
    }

    return NextResponse.json({ error: '未知操作' }, { status: 400 })
  } catch (err) {
    console.error('admin error:', err)
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}
