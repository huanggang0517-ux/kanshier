import { getSupabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex')
  return `${salt}:${hash}`
}

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function POST(req) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

    const { phone, password, inviteCode } = await req.json()

    if (!phone || !password || phone.length !== 11) {
      return NextResponse.json({ error: '请输入正确的手机号和密码' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: '密码至少6位' }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .single()

    if (existing) {
      return NextResponse.json({ error: '该手机号已注册，请登录' }, { status: 400 })
    }

    const password_hash = hashPassword(password)
    const invite_code = generateInviteCode()

    const { data, error } = await supabase
      .from('users')
      .insert({ phone, password_hash, free_count: 6, invite_code })
      .select()
      .single()

    if (error) throw error

    // 如果填了邀请码，给邀请人加1次使用次数
    if (inviteCode) {
      const { data: inviter } = await supabase
        .from('users')
        .select('id, free_count')
        .eq('invite_code', inviteCode.toUpperCase())
        .single()

      if (inviter) {
        await supabase
          .from('users')
          .update({ free_count: (inviter.free_count || 0) + 1 })
          .eq('id', inviter.id)
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.id,
        phone: data.phone,
        free_count: data.free_count,
        is_vip: data.is_vip,
        invite_code: data.invite_code
      }
    })
  } catch (err) {
    console.error('register error:', err)
    return NextResponse.json({ error: '注册失败，请稍后重试' }, { status: 500 })
  }
}
