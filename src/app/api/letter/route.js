import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { callDeepSeek } from '@/lib/deepseek'

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

    const { userId, content, futureDate } = await req.json()
    if (!userId || !content) {
      return NextResponse.json({ error: '请写一封信' }, { status: 400 })
    }

    const { data: user } = await supabase
      .from('users').select('free_count, is_vip').eq('id', userId).single()
    if (!user) return NextResponse.json({ error: '用户不存在' }, { status: 404 })
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
      await supabase.from('users').update({ free_count: user.free_count - 1 }).eq('id', userId)
    }

    const { data: reading } = await supabase
      .from('readings')
      .insert({
        user_id: userId,
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
