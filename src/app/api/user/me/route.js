import { NextResponse } from 'next/server'
import { getActiveUser, unauth } from '@/lib/session'

export async function GET() {
  const user = await getActiveUser()
  if (!user) return unauth()
  return NextResponse.json({ user })
}
