import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { getSessionUser, unauth } from '@/lib/session'

export async function GET(req) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

    const user = await getSessionUser()
    if (!user) return unauth()

    const { searchParams } = new URL(req.url)
    const bookId = searchParams.get('id')

    if (!bookId) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }

    // 管理员可以看任何书，普通用户需要 ebook_access 且书籍已发布
    if (!user.is_admin && !user.ebook_access) {
      return NextResponse.json({ error: '请先解锁书籍库' }, { status: 403 })
    }

    const { data: book } = await supabase
      .from('ebooks')
      .select('file_path, is_published')
      .eq('id', bookId)
      .single()

    if (!book) return NextResponse.json({ error: '书籍不存在' }, { status: 404 })

    if (!user.is_admin && !book.is_published) {
      return NextResponse.json({ error: '书籍不存在' }, { status: 404 })
    }

    // 生成签名 URL（60 分钟有效）
    const supabaseAdmin = getSupabaseAdmin()
    const { data: urlData, error: urlError } = await supabaseAdmin.storage
      .from('ebooks')
      .createSignedUrl(book.file_path, 3600)

    if (urlError) throw urlError

    return NextResponse.json({ signedUrl: urlData.signedUrl })
  } catch (err) {
    console.error('ebook read error:', err)
    return NextResponse.json({ error: '获取阅读链接失败' }, { status: 500 })
  }
}
