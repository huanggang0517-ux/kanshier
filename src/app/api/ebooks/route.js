import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const ADMIN_PHONE = '17614130826'

async function isAdmin(supabase, userId) {
  if (!userId) return false
  const { data } = await supabase.from('users').select('phone').eq('id', userId).single()
  return data?.phone === ADMIN_PHONE
}

export async function GET(req) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const all = searchParams.get('all')
    const adminId = searchParams.get('adminId')

    // 单本书详情
    if (id) {
      const { data } = await supabase.from('ebooks').select('*').eq('id', id).single()
      if (!data) return NextResponse.json({ error: '书籍不存在' }, { status: 404 })
      return NextResponse.json({ book: data })
    }

    // 管理员查看全部（含未发布）
    if (all === 'true' && adminId) {
      if (!(await isAdmin(supabase, adminId))) {
        return NextResponse.json({ error: '无权限' }, { status: 403 })
      }
      const { data } = await supabase.from('ebooks').select('*').order('created_at', { ascending: false })
      return NextResponse.json({ books: data || [] })
    }

    // 用户只看已发布
    const { data } = await supabase.from('ebooks').select('*').eq('is_published', true).order('sort_order', { ascending: true })
    return NextResponse.json({ books: data || [] })
  } catch (err) {
    console.error('ebooks list error:', err)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

    const formData = await req.formData()
    const adminId = formData.get('adminId')
    if (!(await isAdmin(supabase, adminId))) {
      return NextResponse.json({ error: '无权限' }, { status: 403 })
    }

    const action = formData.get('action')

    if (action === 'upload') {
      const file = formData.get('file')
      const title = formData.get('title')
      const author = formData.get('author') || ''
      const description = formData.get('description') || ''

      if (!file || !title) {
        return NextResponse.json({ error: '缺少文件或标题' }, { status: 400 })
      }

      if (file.size > 50 * 1024 * 1024) {
        return NextResponse.json({ error: '文件超过 50MB 限制' }, { status: 400 })
      }

      const supabaseAdmin = getSupabaseAdmin()
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const fileName = `${crypto.randomUUID()}.pdf`
      const filePath = `books/${fileName}`

      const { error: uploadError } = await supabaseAdmin.storage
        .from('ebooks')
        .upload(filePath, buffer, {
          contentType: 'application/pdf',
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data: book, error: dbError } = await supabase
        .from('ebooks')
        .insert({
          title,
          author,
          description,
          file_path: filePath,
          file_size: file.size,
          sort_order: 0,
        })
        .select()
        .single()

      if (dbError) {
        // 回滚存储
        await supabaseAdmin.storage.from('ebooks').remove([filePath])
        throw dbError
      }

      return NextResponse.json({ success: true, book })
    }

    if (action === 'delete') {
      const bookId = formData.get('bookId')
      if (!bookId) return NextResponse.json({ error: '参数不完整' }, { status: 400 })

      const { data: book } = await supabase.from('ebooks').select('file_path').eq('id', bookId).single()
      if (book?.file_path) {
        const supabaseAdmin = getSupabaseAdmin()
        await supabaseAdmin.storage.from('ebooks').remove([book.file_path])
      }

      await supabase.from('ebook_notes').delete().eq('ebook_id', bookId)
      await supabase.from('ebooks').delete().eq('id', bookId)
      return NextResponse.json({ success: true, message: '已删除' })
    }

    if (action === 'toggle_publish') {
      const bookId = formData.get('bookId')
      const { data: book } = await supabase.from('ebooks').select('is_published').eq('id', bookId).single()
      if (!book) return NextResponse.json({ error: '书籍不存在' }, { status: 404 })

      await supabase.from('ebooks').update({ is_published: !book.is_published }).eq('id', bookId)
      return NextResponse.json({ success: true, message: book.is_published ? '已下架' : '已发布', is_published: !book.is_published })
    }

    return NextResponse.json({ error: '未知操作' }, { status: 400 })
  } catch (err) {
    console.error('ebooks admin error:', err)
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}
