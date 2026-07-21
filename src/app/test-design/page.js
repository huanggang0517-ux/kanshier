'use client'

export default function TestDesignPage() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#f5f0e6' }}>

      {/* SVG 滤镜定义 */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="rough">
            <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
          </filter>
          <filter id="ink-spread">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
            <feGaussianBlur stdDeviation="0.5" />
          </filter>
        </defs>
      </svg>

      {/* 飞溅墨点装饰 */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <svg width="100%" height="100%" className="absolute inset-0 opacity-10">
          <circle cx="15%" cy="20%" r="3" fill="#2d2d2d" />
          <circle cx="85%" cy="15%" r="2" fill="#2d2d2d" />
          <circle cx="10%" cy="80%" r="4" fill="#2d2d2d" />
          <circle cx="90%" cy="75%" r="2.5" fill="#2d2d2d" />
          <path d="M200,100 Q210,95 215,105" stroke="#2d2d2d" strokeWidth="1.5" fill="none" />
          <path d="M300,400 Q305,395 310,405" stroke="#2d2d2d" strokeWidth="1" fill="none" />
        </svg>
      </div>

      <div className="relative max-w-sm mx-auto px-6 py-10" style={{ zIndex: 1 }}>

        {/* 标题区 */}
        <header className="mb-12 relative">
          {/* 主标题 */}
          <h1
            className="text-center"
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: '72px',
              fontWeight: '900',
              color: '#1a1a1a',
              lineHeight: '0.85',
              transform: 'rotate(-3deg) skewX(-2deg)',
              letterSpacing: '-2px',
              textShadow: '3px 3px 0 rgba(0,0,0,0.08)',
              filter: 'url(#rough)',
            }}
          >
            玄机
          </h1>

          {/* 下划线 - 粗犷手绘 */}
          <svg className="mx-auto mt-2" width="160" height="12" viewBox="0 0 160 12">
            <path
              d="M5 8 C20 4, 40 10, 60 6 C80 2, 100 9, 120 5 C135 3, 145 7, 155 6"
              stroke="#e63946"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              style={{ filter: 'url(#ink-spread)' }}
            />
          </svg>

          {/* 副标题 */}
          <div className="text-center mt-4">
            <span
              style={{
                fontFamily: "'Caveat', cursive",
                fontSize: '16px',
                color: '#666',
                transform: 'rotate(1deg)',
                display: 'inline-block',
                borderBottom: '2px solid #1a1a1a',
                paddingBottom: '2px',
              }}
            >
              看见玄机，把握人生
            </span>
          </div>
        </header>

        {/* 功能卡片 - 手绘线框风格 */}
        <div className="space-y-6">

          {/* 看事儿 */}
          <button className="w-full text-left group">
            <div
              className="relative p-5"
              style={{
                border: '3px solid #1a1a1a',
                transform: 'rotate(-1.5deg)',
                background: 'transparent',
              }}
            >
              {/* 手绘边框效果 */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: 'url(#rough)' }}>
                <rect x="2" y="2" width="calc(100% - 4px)" height="calc(100% - 4px)"
                  fill="none" stroke="#1a1a1a" strokeWidth="0" />
              </svg>

              <div className="flex items-center gap-4">
                {/* 图标 - 简笔画风格 */}
                <div
                  className="w-14 h-14 flex items-center justify-center relative"
                  style={{
                    border: '3px solid #ff6b35',
                    transform: 'rotate(3deg)',
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M4 8h20M4 14h20M4 20h20" stroke="#ff6b35" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </div>

                <div>
                  <h2 style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: '32px',
                    fontWeight: '900',
                    color: '#1a1a1a',
                    transform: 'rotate(0.5deg)',
                    lineHeight: '1',
                  }}>
                    看事儿
                  </h2>
                  <p style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: '14px',
                    color: '#888',
                    marginTop: '4px',
                  }}>
                    三字测吉凶 · 一事一问
                  </p>
                </div>

                {/* 箭头 */}
                <svg className="ml-auto" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* 底部装饰线 */}
              <div className="absolute bottom-0 left-4 right-4">
                <svg width="100%" height="4" viewBox="0 0 200 4">
                  <path d="M0 2h200" stroke="#ff6b35" strokeWidth="2" strokeDasharray="8 4" />
                </svg>
              </div>
            </div>
          </button>

          {/* 著·墨迹 */}
          <button className="w-full text-left group">
            <div
              className="relative p-5"
              style={{
                border: '3px solid #1a1a1a',
                transform: 'rotate(1deg)',
                background: 'transparent',
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 flex items-center justify-center relative"
                  style={{
                    border: '3px solid #2ec4b6',
                    transform: 'rotate(-2deg)',
                  }}
                >
                  <span style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: '28px',
                    fontWeight: '900',
                    color: '#2ec4b6',
                  }}>一</span>
                </div>

                <div>
                  <h2 style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: '32px',
                    fontWeight: '900',
                    color: '#1a1a1a',
                    transform: 'rotate(-0.5deg)',
                    lineHeight: '1',
                  }}>
                    著 · 墨迹
                  </h2>
                  <p style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: '14px',
                    color: '#888',
                    marginTop: '4px',
                  }}>
                    每日一墨 · 子夜著字
                  </p>
                </div>

                <svg className="ml-auto" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="absolute bottom-0 left-4 right-4">
                <svg width="100%" height="4" viewBox="0 0 200 4">
                  <path d="M0 2h200" stroke="#2ec4b6" strokeWidth="2" strokeDasharray="6 6" />
                </svg>
              </div>
            </div>
          </button>

          {/* 给未来的信 */}
          <button className="w-full text-left group">
            <div
              className="relative p-5"
              style={{
                border: '3px solid #1a1a1a',
                transform: 'rotate(-0.8deg)',
                background: 'transparent',
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 flex items-center justify-center relative"
                  style={{
                    border: '3px solid #e63946',
                    transform: 'rotate(2deg)',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6l9 7 9-7M3 6v12h18V6" stroke="#e63946" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                <div>
                  <h2 style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: '32px',
                    fontWeight: '900',
                    color: '#1a1a1a',
                    transform: 'rotate(0.3deg)',
                    lineHeight: '1',
                  }}>
                    给未来的信
                  </h2>
                  <p style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: '14px',
                    color: '#888',
                    marginTop: '4px',
                  }}>
                    写一段话给明年的自己
                  </p>
                </div>

                {/* 价格标签 */}
                <span
                  className="ml-auto px-3 py-1"
                  style={{
                    background: '#e63946',
                    color: '#fff',
                    fontFamily: "'Caveat', cursive",
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transform: 'rotate(3deg)',
                    border: '2px solid #1a1a1a',
                  }}
                >
                  ¥0.52
                </span>
              </div>

              <div className="absolute bottom-0 left-4 right-4">
                <svg width="100%" height="4" viewBox="0 0 200 4">
                  <path d="M0 2h200" stroke="#e63946" strokeWidth="2" strokeDasharray="10 3" />
                </svg>
              </div>
            </div>
          </button>

          {/* 藏经阁 */}
          <button className="w-full text-left group">
            <div
              className="relative p-5"
              style={{
                border: '3px solid #1a1a1a',
                transform: 'rotate(1.2deg)',
                background: 'transparent',
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 flex items-center justify-center relative"
                  style={{
                    border: '3px solid #f4a261',
                    transform: 'rotate(-1deg)',
                  }}
                >
                  <span style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: '24px',
                    fontWeight: '900',
                    color: '#f4a261',
                  }}>藏</span>
                </div>

                <div>
                  <h2 style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: '32px',
                    fontWeight: '900',
                    color: '#1a1a1a',
                    transform: 'rotate(-0.8deg)',
                    lineHeight: '1',
                  }}>
                    藏经阁
                  </h2>
                  <p style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: '14px',
                    color: '#888',
                    marginTop: '4px',
                  }}>
                    电子书库 · 永久阅读
                  </p>
                </div>

                <svg className="ml-auto" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div className="absolute bottom-0 left-4 right-4">
                <svg width="100%" height="4" viewBox="0 0 200 4">
                  <path d="M0 2h200" stroke="#f4a261" strokeWidth="2" strokeDasharray="5 5" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* 会员卡 */}
        <div className="mt-10">
          <div
            className="relative p-6"
            style={{
              background: '#1a1a1a',
              border: '3px solid #1a1a1a',
              transform: 'rotate(-1deg)',
            }}
          >
            {/* 手绘边框叠加 */}
            <div
              className="absolute inset-1"
              style={{
                border: '2px dashed rgba(255,255,255,0.3)',
              }}
            />

            <div className="relative text-center">
              <p style={{
                fontFamily: "'Caveat', cursive",
                fontSize: '28px',
                fontWeight: '900',
                color: '#fff',
                transform: 'rotate(-1deg)',
                lineHeight: '1',
              }}>
                年 · 玄机会员
              </p>
              <p style={{
                fontFamily: "'Caveat', cursive",
                fontSize: '16px',
                color: '#999',
                marginTop: '8px',
              }}>
                ¥18.8 / 年 · 全部无限用
              </p>

              <button
                className="mt-5 px-10 py-3 relative"
                style={{
                  background: '#e63946',
                  color: '#fff',
                  fontFamily: "'Caveat', cursive",
                  fontSize: '22px',
                  fontWeight: '900',
                  border: '3px solid #fff',
                  transform: 'rotate(1deg)',
                }}
              >
                开通
                {/* 按钮装饰 */}
                <svg className="absolute -top-1 -right-1 w-4 h-4" viewBox="0 0 16 16">
                  <circle cx="8" cy="8" r="3" fill="#ffd93d" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 底部 */}
        <footer className="mt-12 text-center">
          {/* 手绘波浪线 */}
          <svg width="100" height="20" viewBox="0 0 100 20" className="mx-auto mb-4">
            <path
              d="M10 10 Q20 5, 30 10 Q40 15, 50 10 Q60 5, 70 10 Q80 15, 90 10"
              stroke="#1a1a1a"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <p style={{
            fontFamily: "'Caveat', cursive",
            fontSize: '14px',
            color: '#999',
            transform: 'rotate(1deg)',
          }}>
            命由天定 · 运在人为
          </p>
        </footer>
      </div>
    </div>
  )
}
