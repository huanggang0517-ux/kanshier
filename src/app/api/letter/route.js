import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { callDeepSeek } from '@/lib/deepseek'
import { getSessionUser, getActiveUser, unauth } from '@/lib/session'

export async function GET(req) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

    const user = await getSessionUser()
    if (!user) return unauth()

    const { data: readings } = await supabase
      .from('readings')
      .select('id, created_at, input_data')
      .eq('user_id', user.id)
      .eq('service_type', 'letter')
      .order('created_at', { ascending: false })

    const today = new Date().toISOString().split('T')[0]

    const deliverable = (readings || []).filter(r => {
      const fd = r.input_data?.futureDate
      if (!fd) return false
      if (r.input_data?.delivered_at) return false
      return fd <= today
    })

    return NextResponse.json({
      has_deliverable: deliverable.length > 0,
      letters: deliverable.map(r => ({
        id: r.id,
        future_date: r.input_data.futureDate,
        created_at: r.created_at
      }))
    })
  } catch (err) {
    console.error('letter check error:', err)
    return NextResponse.json({ error: '服务器繁忙' }, { status: 500 })
  }
}

const LETTER_SYSTEM_PROMPT = `你是一位温暖睿智的见证者。用户会给未来的自己写一封信。

规则：
1. 用户会写下想对未来的自己说的话
2. 请结合信的内容，给出一段温暖的回应和寄语
3. 输出格式必须严格按以下 JSON 格式，不要加任何 markdown 标记，只输出纯 JSON：

{
  "gua_name": "时光寄语",
  "gua_symbol": "✉",
  "gua_desc": "致未来的你",
  "poem": "四句七言寄语，呼应信中内容",
  "judgment": "吉",
  "category": "书信",
  "interpretation": "一段200字左右的温暖回应，结合信的内容给予鼓励和期许",
  "advice": "几句对未来生活的美好祝愿"
}

要求：温暖、真诚、有力量。`

export async function POST(req) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

    const user = await getActiveUser()
    if (!user) return unauth()

    const { content, futureDate } = await req.json()
    if (!content) {
      return NextResponse.json({ error: '请写一封信' }, { status: 400 })
    }

    if (!user.is_vip && user.free_count < 1) {
      return NextResponse.json({ error: '次数不足' }, { status: 403 })
    }

    const prompt = `用户写给未来自己的信：
---
${content}
---
${futureDate ? `这封信将在 ${futureDate} 被打开。` : ''}
请根据这封信的内容，给用户一段温暖的回应。`

    const result = await callDeepSeek(prompt, LETTER_SYSTEM_PROMPT)

    let parsed
    try {
      const cleaned = result.replace(/```json/g, '').replace(/```/g, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: '生成异常' }, { status: 500 })
    }

    if (!user.is_vip) {
      await supabase.from('users').update({ free_count: user.free_count - 1 }).eq('id', user.id)
    }

    const { data: reading } = await supabase
      .from('readings')
      .insert({
        user_id: user.id,
        service_type: 'letter',
        input_data: { content, futureDate },
        result_data: parsed
      })
      .select()
      .single()

    return NextResponse.json({ success: true, reading_id: reading.id, result: parsed, remaining: user.is_vip ? -1 : user.free_count - 1 })
  } catch (err) {
    console.error('letter error:', err)
    return NextResponse.json({ error: '服务器繁忙' }, { status: 500 })
  }
}
