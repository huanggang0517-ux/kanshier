import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

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

    const { adminId, ebookId, content } = await req.json()
    if (!(await isAdmin(supabase, adminId))) {
      return NextResponse.json({ error: '无权限' }, { status: 403 })
    }

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

    const { searchParams } = new URL(req.url)
    const adminId = searchParams.get('adminId')
    const noteId = searchParams.get('noteId')

    if (!(await isAdmin(supabase, adminId))) {
      return NextResponse.json({ error: '无权限' }, { status: 403 })
    }

    if (!noteId) return NextResponse.json({ error: '参数不完整' }, { status: 400 })

    const { error } = await supabase.from('ebook_notes').delete().eq('id', noteId)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('ebook notes delete error:', err)
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
}
