import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET(req) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: '缺少用户 ID' }, { status: 400 })
    }

    const { data: courses, error } = await supabase
      .from('readings')
      .select('id, input_data, result_data, created_at')
      .eq('user_id', userId)
      .eq('service_type', 'zhihuisuke')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    const list = (courses || []).map(c => ({
      id: c.id,
      requirement: c.input_data?.requirement || '',
      status: c.result_data?.status || 'unknown',
      classroomId: c.result_data?.classroom_id || null,
      classroomUrl: c.result_data?.classroom_url || null,
      title: c.result_data?.title || null,
      error: c.result_data?.error || null,
      createdAt: c.created_at,
    }))

    return NextResponse.json({ courses: list })
  } catch (err) {
    console.error('zhihuisuke courses error:', err)
    return NextResponse.json({ error: '服务器繁忙，请稍后重试' }, { status: 500 })
  }
}
