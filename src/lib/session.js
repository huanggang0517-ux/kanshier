import crypto from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { checkVipExpiry } from '@/lib/auth'

export const COOKIE_NAME = 'ks_session'
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000

const USER_FIELDS = 'id, phone, free_count, is_vip, vip_expiry, invite_code, ebook_access, is_admin, created_at'

export function serializeUser(user) {
  if (!user) return null
  return {
    id: user.id,
    phone: user.phone,
    free_count: user.free_count,
    is_vip: user.is_vip,
    vip_expiry: user.vip_expiry,
    invite_code: user.invite_code,
    ebook_access: !!user.ebook_access,
    is_admin: !!user.is_admin,
  }
}

function cookieOptions(maxAgeSeconds) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: maxAgeSeconds,
  }
}

export async function createSession(userId) {
  const admin = getSupabaseAdmin()
  if (!admin) throw new Error('数据库未配置（服务密钥）')

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString()

  const { error } = await admin
    .from('sessions')
    .insert({ token, user_id: userId, expires_at: expiresAt })

  if (error) throw error
  return { token, expiresAt }
}

export function attachSessionCookie(res, token) {
  res.cookies.set(COOKIE_NAME, token, cookieOptions(SESSION_TTL_MS / 1000))
  return res
}

export function clearSessionCookie(res) {
  res.cookies.set(COOKIE_NAME, '', cookieOptions(0))
  return res
}

export async function getSessionUser() {
  const admin = getSupabaseAdmin()
  if (!admin) return null

  const token = cookies().get(COOKIE_NAME)?.value
  if (!token) return null

  const { data: session } = await admin
    .from('sessions')
    .select('user_id, expires_at')
    .eq('token', token)
    .single()

  if (!session) return null
  if (new Date(session.expires_at) < new Date()) {
    await admin.from('sessions').delete().eq('token', token)
    return null
  }

  const { data: user } = await admin
    .from('users')
    .select(USER_FIELDS)
    .eq('id', session.user_id)
    .single()

  return serializeUser(user)
}

export async function getActiveUser() {
  const admin = getSupabaseAdmin()
  const user = await getSessionUser()
  if (!user) return null
  return checkVipExpiry(admin, user)
}

export function unauth() {
  return NextResponse.json({ error: '请先登录' }, { status: 401 })
}

export function forbidden() {
  return NextResponse.json({ error: '无权限' }, { status: 403 })
}

export async function destroySession() {
  const admin = getSupabaseAdmin()
  if (!admin) return
  const token = cookies().get(COOKIE_NAME)?.value
  if (!token) return
  await admin.from('sessions').delete().eq('token', token)
}
