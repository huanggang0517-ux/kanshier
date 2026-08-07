import { getSupabase } from '@/lib/supabase'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import { hashPassword } from '@/lib/password'
import { getSessionUser, forbidden, unauth } from '@/lib/session'

export async function GET(req) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

    const user = await getSessionUser()
    if (!user) return unauth()
    if (!user.is_admin) return forbidden()

    const { data: users } = await supabase
      .from('users')
      .select('id, phone, free_count, is_vip, vip_expiry, invite_code, created_at, ebook_access, is_admin')
      .order('created_at', { ascending: false })

    const { data: vipOrders } = await supabase
      .from('readings')
      .select('id, user_id, created_at, input_data')
      .eq('service_type', 'vip_payment')
      .order('created_at', { ascending: false })

    const { data: ebookOrders } = await supabase
      .from('readings')
      .select('id, user_id, created_at, input_data')
      .eq('service_type', 'ebook_payment')
      .order('created_at', { ascending: false })

    // 把用户手机号拼到订单里
    const attachPhone = orders => (orders || []).map(order => {
      const u = (users || []).find(u => u.id === order.user_id)
      return { ...order, phone: u?.phone || '未知' }
    })

    return NextResponse.json({
      users: users || [],
      pendingOrders: attachPhone(vipOrders),
      ebookOrders: attachPhone(ebookOrders),
    })
  } catch (err) {
    console.error('admin list error:', err)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

    const user = await getSessionUser()
    if (!user) return unauth()
    if (!user.is_admin) return forbidden()

    const { userId, action, orderId } = await req.json()
    if (!action) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }

    if (action === 'set_vip') {
      if (!userId) return NextResponse.json({ error: '参数不完整' }, { status: 400 })
      const expiry = new Date()
      expiry.setFullYear(expiry.getFullYear() + 1)

      await supabase
        .from('users')
        .update({ is_vip: true, vip_expiry: expiry.toISOString(), free_count: 999 })
        .eq('id', userId)

      return NextResponse.json({ success: true, message: '已开通年卡会员' })
    }

    if (action === 'remove_vip') {
      if (!userId) return NextResponse.json({ error: '参数不完整' }, { status: 400 })
      await supabase
        .from('users')
        .update({ is_vip: false, vip_expiry: null, free_count: 0 })
        .eq('id', userId)

      return NextResponse.json({ success: true, message: '已取消年卡会员' })
    }

    if (action === 'confirm_payment') {
      if (!orderId) return NextResponse.json({ error: '参数不完整' }, { status: 400 })

      const { data: reading } = await supabase
        .from('readings')
        .select('user_id, input_data')
        .eq('id', orderId)
        .single()

      if (!reading) return NextResponse.json({ error: '订单不存在' }, { status: 404 })

      // 标记订单已确认
      await supabase
        .from('readings')
        .update({ input_data: { ...reading.input_data, status: 'confirmed', confirmed_at: new Date().toISOString() } })
        .eq('id', orderId)

      // 开通 VIP
      const expiry = new Date()
      expiry.setFullYear(expiry.getFullYear() + 1)
      await supabase
        .from('users')
        .update({ is_vip: true, vip_expiry: expiry.toISOString(), free_count: 999 })
        .eq('id', reading.user_id)

      return NextResponse.json({ success: true, message: '已确认收款并开通 VIP' })
    }

    if (action === 'confirm_ebook_payment') {
      if (!orderId) return NextResponse.json({ error: '参数不完整' }, { status: 400 })

      const { data: reading } = await supabase
        .from('readings')
        .select('user_id, input_data')
        .eq('id', orderId)
        .single()

      if (!reading) return NextResponse.json({ error: '订单不存在' }, { status: 404 })

      await supabase
        .from('readings')
        .update({ input_data: { ...reading.input_data, status: 'confirmed', confirmed_at: new Date().toISOString() } })
        .eq('id', orderId)

      await supabase
        .from('users')
        .update({ ebook_access: true })
        .eq('id', reading.user_id)

      return NextResponse.json({ success: true, message: '已确认收款并开通书籍库' })
    }

    if (action === 'add_count') {
      if (!userId) return NextResponse.json({ error: '参数不完整' }, { status: 400 })
      const { data: targetUser } = await supabase
        .from('users')
        .select('free_count')
        .eq('id', userId)
        .single()

      await supabase
        .from('users')
        .update({ free_count: (targetUser?.free_count || 0) + 1 })
        .eq('id', userId)

      return NextResponse.json({ success: true, message: '已增加1次免费次数' })
    }

    if (action === 'reset_password') {
      const { phone, newPassword } = await req.json()
      if (!phone || !newPassword || newPassword.length < 6) {
        return NextResponse.json({ error: '参数不完整' }, { status: 400 })
      }

      const { data: target } = await supabase
        .from('users')
        .select('id')
        .eq('phone', phone)
        .single()

      if (!target) return NextResponse.json({ error: '用户不存在' }, { status: 404 })

      const password_hash = hashPassword(newPassword)
      await supabase
        .from('users')
        .update({ password_hash })
        .eq('id', target.id)

      // 踢掉该用户所有旧会话
      const admin = getSupabaseAdmin()
      if (admin) {
        await admin.from('sessions').delete().eq('user_id', target.id)
      }

      return NextResponse.json({ success: true, message: '密码已重置' })
    }

    return NextResponse.json({ error: '未知操作' }, { status: 400 })
  } catch (err) {
    console.error('admin error:', err)
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}
