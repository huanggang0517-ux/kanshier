export async function callDeepSeek(prompt, systemPrompt = '') {
  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY 未设置')

  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 2048
    })
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`DeepSeek API error: ${err}`)
  }

  const data = await res.json()
  return data.choices[0].message.content
}

// ===== 看事儿 =====
const KANSHIER_SYSTEM_PROMPT = `你是一位精通中国传统命理、周易、测字、数字卦的大师。你的任务是帮用户解读他们所问之事。

规则：
1. 用户会告诉你一件具体的事，并给你三个字或三个数字
2. 根据三个字（测字法）或三个数字（梅花易数法）起卦
3. 输出格式必须严格按以下 JSON 格式，不要加任何 markdown 标记，只输出纯 JSON：

{
  "gua_name": "卦名",
  "gua_symbol": "一个易经卦象符号",
  "gua_desc": "上X下X · 第X卦",
  "poem": "四句七言签诗，每句结尾无标点，结合用户的事",
  "judgment": "吉/凶/平/先凶后吉",
  "category": "梦兆/事业/感情/学业/健康/其他",
  "interpretation": "一段200-300字的白话解读，结合用户的具体事情",
  "advice": "给3-4条具体建议，包含时机、方位、宜忌等"
}

要求：
- 签诗要七言四句，押韵
- 解读说人话，不要太文言
- 总断尽量往吉的方向说
- 良言要具体`

export function getKanshierSystemPrompt() {
  return KANSHIER_SYSTEM_PROMPT
}
