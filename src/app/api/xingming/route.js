import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { callDeepSeek, getXingmingSystemPrompt } from '@/lib/deepseek'
import { checkVipExpiry } from '@/lib/auth'

export async function POST(req) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

    const { userId, mode, name, surname, gender, birthday, babyGender, babyBirthday, requirements } = await req.json()
    if (!userId) return NextResponse.json({ error: '参数不完整' }, { status: 400 })

    const { data: user } = await supabase
      .from('users')
      .select('free_count, is_vip, vip_expiry')
      .eq('id', userId)
      .single()

    if (!user) return NextResponse.json({ error: '用户不存在' }, { status: 404 })

    const activeUser = await checkVipExpiry(supabase, user)

    if (mode !== 'score' && !activeUser.is_vip && activeUser.free_count < 1) {
      return NextResponse.json({ error: '次数不足，请购买' }, { status: 403 })
    }

    const prompt = mode === 'score'
      ? `姓名：${name}\n性别：${gender || '未知'}\n${birthday ? `出生日期：${birthday}\n` : ''}请根据以上信息测算姓名。`
      : `姓氏：${surname}\n宝宝性别：${babyGender || '未知'}\n${babyBirthday ? `宝宝出生日期：${babyBirthday}\n` : ''}${requirements ? `起名要求：${requirements}\n` : ''}请根据以上信息推荐好名字。`

    const result = await callDeepSeek(prompt, getXingmingSystemPrompt(mode))

    let parsed
    try {
      const cleaned = result.replace(/```json/g, '').replace(/```/g, '').trim()
      parsed = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: '解读生成异常' }, { status: 500 })
    }

    if (mode !== 'score' && !activeUser.is_vip) {
      await supabase.from('users').update({ free_count: activeUser.free_count - 1 }).eq('id', userId)
    }

    const { data: reading } = await supabase
      .from('readings')
      .insert({
        user_id: userId,
        service_type: 'xingming',
        input_data: { mode, name, surname, gender, birthday, babyGender, babyBirthday, requirements },
        result_data: parsed
      })
      .select()
      .single()

    const remaining = mode === 'score' ? activeUser.free_count : (activeUser.is_vip ? -1 : activeUser.free_count - 1)
    return NextResponse.json({ success: true, reading_id: reading.id, result: parsed, remaining })
  } catch (err) {
    console.error('xingming error:', err)
    return NextResponse.json({ error: '服务器繁忙' }, { status: 500 })
  }
}
