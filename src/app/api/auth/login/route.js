import { getSupabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { verifyPassword } from '@/lib/password'
import { createSession, attachSessionCookie, serializeUser } from '@/lib/session'

export async function POST(req) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

    const { phone, password } = await req.json()

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single()

    if (!user) {
      return NextResponse.json({ error: '手机号未注册' }, { status: 401 })
    }

    if (!verifyPassword(password, user.password_hash)) {
      return NextResponse.json({ error: '密码错误' }, { status: 401 })
    }

    const { token } = await createSession(user.id)
    const res = NextResponse.json({ success: true, user: serializeUser(user) })
    return attachSessionCookie(res, token)
  } catch (err) {
    console.error('login error:', err)
    return NextResponse.json({ error: '登录失败' }, { status: 500 })
  }
}
