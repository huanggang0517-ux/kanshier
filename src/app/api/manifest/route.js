import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET(req) {
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('user_id')
  const year = searchParams.get('year') || String(new Date().getFullYear())

  if (!userId) return NextResponse.json({ error: '缺少参数' }, { status: 400 })

  const startDate = `${year}-01-01`
  const endDate = `${year}-12-31`

  const { data, error } = await supabase
    .from('manifest_entries')
    .select('id, date, stroke_data, is_locked, hidden_message, mood')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ entries: data })
}

export async function POST(req) {
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

  const { userId, date, strokeData, mood } = await req.json()
  if (!userId || !date || !strokeData) {
    return NextResponse.json({ error: '参数不完整' }, { status: 400 })
  }

  const { data: existing } = await supabase
    .from('manifest_entries')
    .select('id, is_locked')
    .eq('user_id', userId)
    .eq('date', date)
    .single()

  if (existing?.is_locked) {
    return NextResponse.json({ error: '该日已著定，不可修改' }, { status: 403 })
  }

  if (existing) {
    const { data, error } = await supabase
      .from('manifest_entries')
      .update({ stroke_data: strokeData, mood, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ entry: data })
  }

  const { data, error } = await supabase
    .from('manifest_entries')
    .insert({ user_id: userId, date, stroke_data: strokeData })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ entry: data })
}

export async function PATCH(req) {
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

  const { entryId, hiddenMessage, lock, mood } = await req.json()
  if (!entryId) return NextResponse.json({ error: '缺少参数' }, { status: 400 })

  const updates = {}
  if (hiddenMessage !== undefined) updates.hidden_message = hiddenMessage
  if (lock === true) updates.is_locked = true
  if (mood !== undefined) updates.mood = mood

  const { data, error } = await supabase
    .from('manifest_entries')
    .update(updates)
    .eq('id', entryId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ entry: data })
}
