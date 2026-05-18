import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { callDeepSeek, getKanshierSystemPrompt } from '@/lib/deepseek'

export async function POST(req) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

    const { userId, question, inputType, inputValue } = await req.json()

    if (!question || !inputValue || !userId) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }

    const { data: user } = await supabase
      .from('users')
      .select('free_count, is_vip')
      .eq('id', userId)
      .single()

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const canProceed = user.is_vip || user.free_count > 0
    if (!canProceed) {
      return NextResponse.json({ error: '次数不足，请购买年卡', needPayment: true }, { status: 403 })
    }

    const typeLabel = inputType === 'char' ? '测字' : '数字卦'
    const prompt = `用户问的事情：${question}\n\n用户给的${typeLabel === '测字' ? '三个字' : '三个数字'}：${inputValue}\n\n请根据以上信息起卦解读。`

    const systemPrompt = getKanshierSystemPrompt()
    const result = await callDeepSeek(prompt, systemPrompt)

    let parsed
    try {
      const cleaned = result.replace(/```json/g, '').replace(/```/g, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: '解读生成异常，请重试' }, { status: 500 })
    }

    if (!user.is_vip) {
      await supabase
        .from('users')
        .update({ free_count: user.free_count - 1 })
        .eq('id', userId)
    }

    const { data: reading } = await supabase
      .from('readings')
      .insert({
        user_id: userId,
        service_type: 'kanshier',
        input_data: { question, inputType, inputValue },
        result_data: parsed
      })
      .select()
      .single()

    return NextResponse.json({
      success: true,
      reading_id: reading.id,
      result: parsed,
      remaining: user.is_vip ? -1 : user.free_count - 1
    })
  } catch (err) {
    console.error('kanshier error:', err)
    return NextResponse.json({ error: '服务器繁忙，请稍后重试' }, { status: 500 })
  }
}

export async function GET(req) {
  const supabase = getSupabase()
  if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const userId = searchParams.get('user_id')

  if (!id || !userId) {
    return NextResponse.json({ error: '缺少参数' }, { status: 400 })
  }

  const { data: reading } = await supabase
    .from('readings')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (!reading) {
    return NextResponse.json({ error: '记录不存在' }, { status: 404 })
  }

  return NextResponse.json({ reading, result: reading.result_data })
}
