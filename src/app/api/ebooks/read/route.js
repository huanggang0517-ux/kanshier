import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

    const { searchParams } = new URL(req.url)
    const bookId = searchParams.get('id')
    const userId = searchParams.get('userId')

    if (!bookId || !userId) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }

    // 验证用户有权限
    const { data: user } = await supabase
      .from('users')
      .select('ebook_access, phone')
      .eq('id', userId)
      .single()

    if (!user) return NextResponse.json({ error: '用户不存在' }, { status: 404 })

    // 管理员可以看任何书，其他用户需要 ebook_access
    const isAdmin = user.phone === '17614130826'
    if (!isAdmin && !user.ebook_access) {
      return NextResponse.json({ error: '请先解锁书籍库' }, { status: 403 })
    }

    // 获取书籍信息
    const { data: book } = await supabase
      .from('ebooks')
      .select('file_path')
      .eq('id', bookId)
      .single()

    if (!book) return NextResponse.json({ error: '书籍不存在' }, { status: 404 })

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
