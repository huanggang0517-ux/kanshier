import { NextResponse } from 'next/server'

export async function GET() {
  // 本地开发用 OPENMAIC_BASE_URL，生产环境用 Vercel 对应的 OpenMAIC 域名（浏览器可直接访问）
  const baseUrl = process.env.OPENMAIC_BASE_URL
    || process.env.NEXT_PUBLIC_OPENMAIC_FRONTEND_URL
    || 'https://openmaic.kanshier.top'
  return NextResponse.json({ baseUrl })
}
