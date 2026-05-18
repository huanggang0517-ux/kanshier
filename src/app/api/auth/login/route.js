import { getSupabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':')
  const verify = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return hash === verify
}

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

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        free_count: user.free_count,
        is_vip: user.is_vip,
        vip_expiry: user.vip_expiry,
        invite_code: user.invite_code
      }
    })
  } catch (err) {
    console.error('login error:', err)
    return NextResponse.json({ error: '登录失败' }, { status: 500 })
  }
}
