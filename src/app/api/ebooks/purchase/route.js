import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { getSessionUser, unauth } from '@/lib/session'

export async function POST(req) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

    const user = await getSessionUser()
    if (!user) return unauth()

    const { method } = await req.json()
    if (!method) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }

    const { data: dbUser, error: userErr } = await supabase
      .from('users')
      .select('phone, ebook_access')
      .eq('id', user.id)
      .single()

    if (userErr || !dbUser) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    if (dbUser.ebook_access) {
      return NextResponse.json({ error: '你已经解锁了全部书籍' }, { status: 400 })
    }

    const { error } = await supabase.from('readings').insert({
      user_id: user.id,
      service_type: 'ebook_payment',
      input_data: { method, status: 'pending' },
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('ebook purchase error:', err)
    return NextResponse.json({ error: '提交失败，请重试' }, { status: 500 })
  }
}
