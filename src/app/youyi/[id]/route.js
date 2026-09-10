import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

const BUCKET = 'games'

// 不放 sandbox：sandbox 会令文档变成 opaque origin，localStorage 直接抛错，互动工具的存档就废了。
// 改用严格 source 白名单——connect-src 断网、form-action 断提交，足以覆盖现实的滥用路径。
const CSP = [
  "default-src 'none'",
  "script-src 'unsafe-inline'",
  "style-src 'unsafe-inline'",
  "img-src data: blob:",
  "font-src data:",
  "media-src data: blob:",
  "connect-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
].join('; ')

export async function GET(req, { params }) {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) return new NextResponse('服务未配置', { status: 500 })

    const { data: item } = await supabase
      .from('games')
      .select('file_path')
      .eq('id', params.id)
      .eq('is_published', true)
      .single()

    if (!item) return new NextResponse('未找到该内容', { status: 404 })

    const { data: blob, error } = await supabase.storage
      .from(BUCKET)
      .download(item.file_path, {}, { cache: 'no-store' })

    if (error || !blob) return new NextResponse('未找到该内容', { status: 404 })

    const html = await blob.text()

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Security-Policy': CSP,
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('youyi play error:', err)
    return new NextResponse('加载失败', { status: 500 })
  }
}
