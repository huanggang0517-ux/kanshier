'use client'

export default function ResultDisplay({ result }) {
  if (!result) return null

  const { gua_name, gua_symbol, gua_desc, poem, judgment, category, interpretation, advice } = result

  const judgmentColors = {
    '吉': '#4ade80',
    '先凶后吉': '#fbbf24',
    '平': '#94a3b8',
    '凶': '#f87171',
    '先吉后凶': '#fb923c',
  }

  return (
    <div>
      <div className="text-center py-8">
        <div
          className="w-[72px] h-[72px] rounded-full mx-auto mb-3 flex items-center justify-center text-3xl"
          style={{
            background: 'var(--bg-card)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
          }}
        >
          {gua_symbol || '☯'}
        </div>
        <h2 className="text-xl font-semibold tracking-wider" style={{ color: 'var(--gold-primary)' }}>
          {gua_name}
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
          {gua_desc}
        </p>
      </div>

      <div
        className="rounded-2xl p-5 text-center mb-4 border"
        style={{
          background: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <div className="text-sm leading-loose tracking-wider" style={{ color: 'var(--text-primary)' }}>
          {poem?.split('\n').map((line, i) => <div key={i}>{line}</div>)}
        </div>
        <div className="mt-3 pt-3 flex justify-center gap-6" style={{ borderTop: '1px solid var(--border-color)' }}>
          <div className="text-center">
            <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>总断</div>
            <div className="text-sm font-semibold mt-0.5" style={{ color: judgmentColors[judgment] || 'var(--gold-primary)' }}>
              {judgment}
            </div>
          </div>
          <div className="text-center">
            <div style={{ color: 'var(--text-secondary)', fontSize: 12 }}>所问</div>
            <div className="text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{category}</div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>解读</h3>
        <p className="text-sm leading-relaxed" style={{ color: '#666' }}>
          {interpretation}
        </p>
      </div>

      <div
        className="rounded-xl p-4 mb-6 border"
        style={{
          background: 'var(--gradient-card)',
          borderColor: 'var(--border-color)'
        }}
      >
        <div className="text-xs font-medium mb-1.5" style={{ color: 'var(--gold-primary)' }}>▎良言</div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
          {advice}
        </p>
      </div>
    </div>
  )
}
