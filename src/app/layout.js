import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import LetterReminder from '@/components/LetterReminder'
import { Noto_Serif_SC } from 'next/font/google'
import './globals.css'

const notoSerif = Noto_Serif_SC({
  weight: ['400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
})

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
      <body className={notoSerif.variable}>
        <ThemeProvider>
          <AuthProvider>
            <div className="app-container">
              {children}
              <LetterReminder />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
