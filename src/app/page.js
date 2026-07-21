import Link from 'next/link'
import Header from '@/components/Header'
import Card from '@/components/ui/Card'
import SealStamp from '@/components/ui/SealStamp'

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="pb-8">

        {/* ===== 水墨意境 — Hero ===== */}
        <section className="relative pt-10 pb-6 text-center overflow-hidden">
          {/* 墨晕 */}
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, var(--ink) 0%, transparent 70%)', opacity: 0.05 }}
          />

          {/* 日课 */}
          <p
            className="font-serif text-xs tracking-widest relative"
            style={{ color: 'var(--text-muted)' }}
          >
            今日宜 · 谋事在晨
          </p>

          {/* 竖排主标题 */}
          <div className="flex justify-center mt-6 relative">
            <span
              className="font-serif text-5xl font-black"
              style={{
                color: 'var(--ink)',
                writingMode: 'vertical-rl',
                textOrientation: 'upright',
                letterSpacing: '0.3em',
                lineHeight: 0.85,
              }}
            >
              玄机
            </span>
          </div>

          {/* 朱砂印章 */}
          <div className="flex justify-center mt-5 relative">
            <SealStamp variant="cinnabar" rotation={-2}>
              看事儿
            </SealStamp>
          </div>

          {/* 装饰分隔 */}
          <div className="flex items-center justify-center gap-2 mt-8 relative">
            <div className="w-8 h-px" style={{ background: 'var(--ink-muted)', opacity: 0.15 }} />
            <div className="w-1 h-1 rotate-45" style={{ background: 'var(--gold)' }} />
            <div className="w-8 h-px" style={{ background: 'var(--ink-muted)', opacity: 0.15 }} />
          </div>
        </section>

        {/* ===== 三大功能 ===== */}
        <div className="flex flex-col gap-4">

          {/* 看事儿 — 阳 · 金色 */}
          <FeatureCard
            href="/kanshier"
            accent="gold"
            icon={<span className="text-lg" style={{ color: '#fff' }}>☰</span>}
            title="看事儿"
            description="三字测吉凶 · 一事一问"
          />

          {/* 著 — 阴 · 墨色 */}
          <FeatureCard
            href="/manifest"
            accent="ink"
            icon={<span className="text-lg font-serif font-black" style={{ color: '#fff' }}>一</span>}
            title="著"
            description="每日一墨 · 子夜著字"
          />

          {/* 给未来的信 — 朱砂 */}
          <LetterCard />

          {/* 藏经阁 — 金色 */}
          <FeatureCard
            href="/ebooks"
            accent="gold"
            icon={<span className="text-lg font-serif font-black" style={{ color: '#fff' }}>藏</span>}
            title="藏经阁"
            description="电子书库 · ¥16.8 永久阅读"
          />

        </div>

        {/* ===== 会员 ===== */}
        <section className="relative mt-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
            <span
              className="font-serif text-[10px] tracking-widest"
              style={{ color: 'var(--ink-muted)', opacity: 0.5 }}
            >
              会 员
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
          </div>

          <Link href="/vip">
            <Card variant="gold" decorations={{ corners: false, innerBorder: false }} padding={false}>
              <div className="relative py-4 px-5 flex items-center justify-between">
                {/* 装饰纹 */}
                <div
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.1) 4px, rgba(0,0,0,0.1) 5px)',
                  }}
                />
                <div className="flex flex-col gap-0.5 relative">
                  <span className="font-serif text-sm font-bold tracking-wider text-white">
                    年·玄机会员
                  </span>
                  <span className="text-xs text-white/80 font-serif tracking-wider">
                    ¥18.8 / 年 · 全部无限用
                  </span>
                </div>
                <span
                  className="font-serif text-xs px-4 py-1.5 tracking-wider text-white relative"
                  style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 'var(--radius-pill)' }}
                >
                  开通
                </span>
              </div>
            </Card>
          </Link>
        </section>

        {/* ===== Footer ===== */}
        <footer className="text-center pt-10 pb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-px" style={{ background: 'var(--ink-muted)', opacity: 0.15 }} />
            <div className="w-1 h-1 rounded-full" style={{ background: 'var(--gold)' }} />
            <div className="w-6 h-px" style={{ background: 'var(--ink-muted)', opacity: 0.15 }} />
          </div>
          <p
            className="font-serif text-xs tracking-widest"
            style={{ color: 'var(--ink-muted)', opacity: 0.4 }}
          >
            命由天定 · 运在人为
          </p>
        </footer>
      </main>
    </>
  )
}

/* =============================================
   功能卡片组件
   ============================================= */
function FeatureCard({ href, accent, icon, title, description }) {
  const config = {
    gold: {
      gradient: 'var(--gradient-gold)',
      shadow: 'var(--shadow-gold)',
      color: 'var(--gold)',
    },
    ink: {
      gradient: 'var(--gradient-ink)',
      shadow: 'var(--shadow-sm)',
      color: 'var(--ink)',
    },
  }
  const c = config[accent] || config.gold

  return (
    <Link href={href} className="block group">
      <Card
        variant="parchment"
        elevation="sm"
        decorations={{ corners: true, innerBorder: true, stitches: true }}
        accent={accent === 'cinnabar' ? 'left' : null}
      >
        <div className="flex items-center gap-4 relative">
          {/* 圆形图标 — 团扇 */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: c.gradient,
              boxShadow: c.shadow,
            }}
          >
            {icon}
          </div>

          <div className="flex-1 min-w-0">
            <h2
              className="font-serif text-base font-bold tracking-wider"
              style={{ color: 'var(--text-primary)' }}
            >
              {title}
            </h2>
            <p
              className="font-serif text-xs tracking-wider mt-1"
              style={{ color: 'var(--text-secondary)' }}
            >
              {description}
            </p>
          </div>

          <span
            className="font-serif text-lg shrink-0 transition-all group-hover:translate-x-1"
            style={{ color: c.color, opacity: 0.4 }}
          >
            →
          </span>
        </div>
      </Card>
    </Link>
  )
}

/* =============================================
   给未来的信 — 特殊信笺卡片
   ============================================= */
function LetterCard() {
  return (
    <Link href="/letter" className="block group">
      <Card
        variant="parchment"
        elevation="sm"
        decorations={{ corners: true, innerBorder: true, stitches: false }}
        accent="left"
        style={{ borderLeft: '3px solid var(--cinnabar)' }}
      >
        {/* 信笺底纹 — 横线 */}
        <div className="absolute inset-x-5 inset-y-8 pointer-events-none opacity-[0.06]">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-px w-full mb-2.5" style={{ background: 'var(--ink)' }} />
          ))}
        </div>

        {/* 信封折角装饰 */}
        <div
          className="absolute top-2 right-2 w-5 h-5 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, transparent 50%, var(--border-color) 50%)',
            opacity: 0.25,
          }}
        />

        <div className="flex items-center gap-4 relative">
          {/* 信封图标 */}
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: 'var(--gradient-cinnabar)',
              boxShadow: 'var(--shadow-cinnabar)',
            }}
          >
            <span className="font-serif text-sm font-bold text-white">封</span>
          </div>

          <div className="flex-1 min-w-0">
            <h2
              className="font-serif text-base font-bold tracking-wider"
              style={{ color: 'var(--text-primary)' }}
            >
              给未来的信
            </h2>
            <p
              className="font-serif text-xs tracking-wider mt-1"
              style={{ color: 'var(--text-secondary)' }}
            >
              写一段话给明年的自己
            </p>
          </div>

          {/* 朱砂印章价格 */}
          <span
            className="font-serif text-[11px] px-2 py-1 shrink-0"
            style={{
              color: '#fff',
              background: 'var(--cinnabar)',
              transform: 'rotate(2deg)',
              letterSpacing: '0.1em',
            }}
          >
            ¥0.52
          </span>
        </div>
      </Card>
    </Link>
  )
}
