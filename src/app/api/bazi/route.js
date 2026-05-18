import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { callDeepSeek, getBaziSystemPrompt } from '@/lib/deepseek'

export async function POST(req) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

    const { userId, birthday, birthHour, gender } = await req.json()
    if (!userId || !birthday) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }

    const { data: user } = await supabase
      .from('users')
      .select('free_count, is_vip')
      .eq('id', userId)
      .single()

    if (!user) return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    if (!user.is_vip && user.free_count < 1) {
      return NextResponse.json({ error: '次数不足，请购买' }, { status: 403 })
    }

    const prompt = `用户出生日期：${birthday}
出生时辰：${birthHour || '未知'}
性别：${gender || '未知'}

请根据以上信息排出八字，并做详细解读。`

    const result = await callDeepSeek(prompt, getBaziSystemPrompt())

    let parsed
    try {
      const cleaned = result.replace(/```json/g, '').replace(/```/g, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: '解读生成异常' }, { status: 500 })
    }

    if (!user.is_vip) {
      await supabase.from('users').update({ free_count: user.free_count - 1 }).eq('id', userId)
    }

    const { data: reading } = await supabase
      .from('readings')
      .insert({ user_id: userId, service_type: 'bazi', input_data: { birthday, birthHour, gender }, result_data: parsed })
      .select()
      .single()

    return NextResponse.json({ success: true, reading_id: reading.id, result: parsed, remaining: user.is_vip ? -1 : user.free_count - 1 })
  } catch (err) {
    console.error('bazi error:', err)
    return NextResponse.json({ error: '服务器繁忙' }, { status: 500 })
  }
}
