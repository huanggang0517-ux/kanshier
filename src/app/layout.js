import { ThemeProvider } from '@/contexts/ThemeContext'
import LetterReminder from '@/components/LetterReminder'
import './globals.css'

export const metadata = {
  title: '玄机 · 看事儿',
  description: 'AI 命理小工具 · 三字测吉凶',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div className="container">
            {children}
            <LetterReminder />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
