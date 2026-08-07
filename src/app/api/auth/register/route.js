import { getSupabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { hashPassword } from '@/lib/password'
import { createSession, attachSessionCookie, serializeUser } from '@/lib/session'

function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function supabaseAdminFetch(path, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`
  let res
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
  } catch (e) {
    console.error('supabaseAdminFetch network error:', url, e.name, e.message, e.cause, e.code)
    throw new Error(`Supabase 不可达: ${e.message}`)
  }
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Supabase API ${res.status}: ${body}`)
  }
  return res
}

export async function POST(req) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: '数据库未配置（服务密钥）' }, { status: 500 })
    }

    const { phone, password, inviteCode } = await req.json()

    if (!phone || !password || phone.length !== 11) {
      return NextResponse.json({ error: '请输入正确的手机号和密码' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: '密码至少6位' }, { status: 400 })
    }

    // 用 anon key 查询是否已注册
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

    // 用 service role key 直接调 REST API 写入（绕过 RLS）
    const insertRes = await supabaseAdminFetch('users', {
      method: 'POST',
      body: JSON.stringify({ phone, password_hash, free_count: 6, invite_code }),
      headers: { Prefer: 'return=representation' },
    })
    const [newUser] = await insertRes.json()
    if (!newUser) {
      return NextResponse.json({ error: '注册失败，无返回数据' }, { status: 500 })
    }

    // 如果填了邀请码，给邀请人加1次使用次数
    if (inviteCode) {
      try {
        const inviterRes = await supabaseAdminFetch(
          `users?select=id,free_count&invite_code=eq.${encodeURIComponent(inviteCode.toUpperCase())}`,
        )
        const inviters = await inviterRes.json()
        if (inviters && inviters.length > 0) {
          const inviter = inviters[0]
          await supabaseAdminFetch(
            `users?id=eq.${inviter.id}`,
            {
              method: 'PATCH',
              body: JSON.stringify({ free_count: (inviter.free_count || 0) + 1 }),
            },
          )
        }
      } catch (e) {
        console.error('register invite code error:', e)
      }
    }

    const { token } = await createSession(newUser.id)
    const res = NextResponse.json({ success: true, user: serializeUser(newUser) })
    return attachSessionCookie(res, token)
  } catch (err) {
    console.error('register error:', err.name, err.message, err.cause, err.code)
    return NextResponse.json({ error: `注册失败: ${err.message}`, detail: err.cause?.message || err.code }, { status: 500 })
  }
}
