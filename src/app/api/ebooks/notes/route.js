import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getSessionUser, forbidden, unauth } from '@/lib/session'

export async function GET(req) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

    const { searchParams } = new URL(req.url)
    const ebookId = searchParams.get('ebookId')

    if (!ebookId) return NextResponse.json({ error: '参数不完整' }, { status: 400 })

    const { data } = await supabase
      .from('ebook_notes')
      .select('*')
      .eq('ebook_id', ebookId)
      .order('created_at', { ascending: false })

    return NextResponse.json({ notes: data || [] })
  } catch (err) {
    console.error('ebook notes error:', err)
    return NextResponse.json({ error: '获取失败' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

    const user = await getSessionUser()
    if (!user) return unauth()
    if (!user.is_admin) return forbidden()

    const { ebookId, content } = await req.json()
    if (!ebookId || !content?.trim()) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('ebook_notes')
      .insert({ ebook_id: ebookId, content: content.trim() })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, note: data })
  } catch (err) {
    console.error('ebook notes add error:', err)
    return NextResponse.json({ error: '添加失败' }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

    const user = await getSessionUser()
    if (!user) return unauth()
    if (!user.is_admin) return forbidden()

    const { searchParams } = new URL(req.url)
    const noteId = searchParams.get('noteId')

    if (!noteId) return NextResponse.json({ error: '参数不完整' }, { status: 400 })

    const { error } = await supabase.from('ebook_notes').delete().eq('id', noteId)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('ebook notes delete error:', err)
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
}
