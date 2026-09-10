import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getSessionUser, forbidden, unauth } from '@/lib/session'

export const dynamic = 'force-dynamic'

const BUCKET = 'games'

// Vercel Serverless 请求体上限 4.5MB，留出 multipart 开销余量
const MAX_SIZE = 4 * 1024 * 1024

export async function GET(req) {
  try {
    // games 表开了 RLS 且没有 policy，anon client 恒返回空，一律走 service-role
    const supabase = getSupabaseAdmin()
    if (!supabase) return NextResponse.json({ error: '存储未配置' }, { status: 500 })

    const { searchParams } = new URL(req.url)

    // 管理员查看全部（含未发布）
    if (searchParams.get('all') === 'true') {
      const user = await getSessionUser()
      if (!user) return unauth()
      if (!user.is_admin) return forbidden()
    }

    let query = supabase
      .from('games')
      .select('id, title, description, file_size, sort_order, is_published, created_at')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (searchParams.get('all') !== 'true') {
      query = query.eq('is_published', true)
    }

    const { data } = await query

    return NextResponse.json({ items: data || [] })
  } catch (err) {
    console.error('youyi list error:', err)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) return NextResponse.json({ error: '存储未配置' }, { status: 500 })

    const user = await getSessionUser()
    if (!user) return unauth()
    if (!user.is_admin) return forbidden()

    const formData = await req.formData()
    const action = formData.get('action')

    if (action === 'upload') {
      const file = formData.get('file')
      const title = formData.get('title')
      const description = formData.get('description') || ''

      if (!file || !title) {
        return NextResponse.json({ error: '缺少文件或标题' }, { status: 400 })
      }
      if (!file.name.toLowerCase().endsWith('.html')) {
        return NextResponse.json({ error: '仅支持 .html 单文件' }, { status: 400 })
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: '文件超过 4MB 限制' }, { status: 400 })
      }

      const buffer = Buffer.from(await file.arrayBuffer())
      const text = buffer.toString('utf8')

      if (!/<html[\s>]/i.test(text) && !/<!doctype\s+html/i.test(text)) {
        return NextResponse.json({ error: '不是完整的 HTML 文件（缺少 <html> 或 <!DOCTYPE>）' }, { status: 400 })
      }

      const filePath = `items/${crypto.randomUUID()}.html`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, buffer, {
          contentType: 'text/html; charset=utf-8',
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data: item, error: dbError } = await supabase
        .from('games')
        .insert({ title, description, file_path: filePath, file_size: file.size, sort_order: 0 })
        .select()
        .single()

      if (dbError) {
        await supabase.storage.from(BUCKET).remove([filePath])
        throw dbError
      }

      const externalRefs = (text.match(/(?:src|href)\s*=\s*["']https?:\/\//gi) || []).length

      return NextResponse.json({ success: true, item, externalRefs })
    }

    if (action === 'delete') {
      const id = formData.get('id')
      if (!id) return NextResponse.json({ error: '参数不完整' }, { status: 400 })

      const { data: item } = await supabase.from('games').select('file_path').eq('id', id).single()
      if (item?.file_path) {
        await supabase.storage.from(BUCKET).remove([item.file_path])
      }

      await supabase.from('games').delete().eq('id', id)
      return NextResponse.json({ success: true, message: '已删除' })
    }

    if (action === 'toggle_publish') {
      const id = formData.get('id')
      if (!id) return NextResponse.json({ error: '参数不完整' }, { status: 400 })

      const { data: item } = await supabase.from('games').select('is_published').eq('id', id).single()
      if (!item) return NextResponse.json({ error: '条目不存在' }, { status: 404 })

      await supabase.from('games').update({ is_published: !item.is_published }).eq('id', id)
      return NextResponse.json({
        success: true,
        message: item.is_published ? '已下架' : '已发布',
        is_published: !item.is_published,
      })
    }

    return NextResponse.json({ error: '未知操作' }, { status: 400 })
  } catch (err) {
    console.error('youyi admin error:', err)
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}
