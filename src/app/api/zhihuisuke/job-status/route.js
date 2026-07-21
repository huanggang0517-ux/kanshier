import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function POST(req) {
  try {
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: '数据库未配置' }, { status: 500 })

    const { jobId, status, step, progress, message, result, error } = await req.json()

    if (!jobId) {
      return NextResponse.json({ error: '缺少 jobId' }, { status: 400 })
    }

    // 用 service role key 更新 readings 表
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: '数据库未配置' }, { status: 500 })
    }

    const updateData = {
      result_data: { status, step, progress, message, error: error || null, result: result || null },
    }

    if (status === 'succeeded' && result?.classroomId) {
      updateData.result_data.classroom_id = result.classroomId
      updateData.result_data.classroom_url = result.url
    }

    // openmaic_job_id 存在 input_data (JSONB) 字段中
    const jsonPath = `input_data->>openmaic_job_id`
    const res = await fetch(`${supabaseUrl}/rest/v1/readings?${jsonPath}=eq.${encodeURIComponent(jobId)}`, {
      method: 'PATCH',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(updateData),
    })

    if (!res.ok) {
      console.error('job-status update failed:', res.status, await res.text())
      return NextResponse.json({ error: '更新失败' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('job-status error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
