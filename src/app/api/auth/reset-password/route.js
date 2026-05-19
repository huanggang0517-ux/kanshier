import { getSupabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

export async function POST(req) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

    const { phone, newPassword } = await req.json()
    if (!phone || !newPassword) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: '密码至少6位' }, { status: 400 })
    }

    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .single()

    if (!user) return NextResponse.json({ error: '手机号未注册' }, { status: 404 })

    const password_hash = hashPassword(newPassword)
    await supabase.from('users').update({ password_hash }).eq('id', user.id)

    return NextResponse.json({ success: true, message: '密码已重置' })
  } catch (err) {
    console.error('reset password error:', err)
    return NextResponse.json({ error: '重置失败' }, { status: 500 })
  }
}
