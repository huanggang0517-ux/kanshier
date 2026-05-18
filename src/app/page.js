import Header from '@/components/Header'
import ServiceCard from '@/components/ServiceCard'

export default function HomePage() {
  const featured = [
    { href: '/kanshier', icon: '🔮', title: '看事儿', subtitle: '三字测吉凶 · 一事一问', featured: true },
  ]

  const gridServices = [
    { href: '/bazi', icon: '☰', title: '八字精批', price: '¥19.9' },
    { href: '/taohua', icon: '🌺', title: '测桃花', price: '¥19.9' },
    { href: '/letter', icon: '✉', title: '给未来写信', price: '¥9.9' },
    { href: '/xingming', icon: '文', title: '姓名·起名', price: '¥9.9' },
  ]

  return (
    <>
      <Header />
      <div className="text-center py-6">
        <div
          className="w-[72px] h-[72px] rounded-full mx-auto mb-3 flex items-center justify-center text-3xl text-white"
          style={{ background: 'linear-gradient(135deg, #c9a96e, #e8d5b5)' }}
        >
          玄
        </div>
        <p style={{ color: 'var(--gold-primary)', fontSize: 15 }}>今日宜 谋事</p>
      </div>

      <ServiceCard {...featured[0]} />

      <div className="grid grid-cols-2 gap-3">
        {gridServices.map((s, i) => (
          <ServiceCard key={i} {...s} />
        ))}
      </div>

      <a href="/vip">
        <div
          className="mt-4 rounded-xl p-3.5 flex justify-between items-center border"
          style={{
            background: 'var(--gradient-card)',
            borderColor: 'var(--border-color)'
          }}
        >
          <div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>看事儿年卡 · 不限次</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>¥58 / 年 · 看事儿无限用</div>
          </div>
          <div
            className="text-white text-xs font-semibold px-4 py-1.5 rounded-full"
            style={{ background: 'var(--gold-primary)' }}
          >
            开通
          </div>
        </div>
      </a>

      <div className="text-center py-6" style={{ color: 'var(--text-muted)', fontSize: 11, letterSpacing: 1 }}>
        命由天定 · 运在人为
      </div>
    </>
  )
}
