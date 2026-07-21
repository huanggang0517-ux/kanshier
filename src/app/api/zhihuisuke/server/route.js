import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = process.env.OPENMAIC_BASE_URL
  if (!baseUrl) {
    return NextResponse.json({ error: '智慧速课服务未配置（OPENMAIC_BASE_URL）' }, { status: 500 })
  }
  return NextResponse.json({ baseUrl })
}
