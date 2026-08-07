import { getSupabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { hashPassword, verifyPassword } from '@/lib/password'
import { getSessionUser, unauth } from '@/lib/session'

export async function POST(req) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

    const user = await getSessionUser()
    if (!user) return unauth()

    const { oldPassword, newPassword } = await req.json()
    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: '新密码至少6位' }, { status: 400 })
    }

    const { data: dbUser } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', user.id)
      .single()

    if (!dbUser) return NextResponse.json({ error: '用户不存在' }, { status: 404 })

    if (!verifyPassword(oldPassword, dbUser.password_hash)) {
      return NextResponse.json({ error: '旧密码错误' }, { status: 403 })
    }

    const password_hash = hashPassword(newPassword)
    await supabase.from('users').update({ password_hash }).eq('id', user.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('change password error:', err)
    return NextResponse.json({ error: '修改失败' }, { status: 500 })
  }
}
