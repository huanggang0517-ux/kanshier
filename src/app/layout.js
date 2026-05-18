import { ThemeProvider } from '@/contexts/ThemeContext'
import './globals.css'

export const metadata = {
  title: '玄机 · 看事儿',
  description: 'AI 命理小工具 · 三字测吉凶',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div className="container">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
