'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getUser, setUser, clearUser } from '@/lib/utils'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null)
  const [loading, setLoading] = useState(true)

  // 挂载时：先用 localStorage 缓存垫首帧，再请求 /api/user/me 校准
  useEffect(() => {
    setUserState(getUser())

    async function fetchMe() {
      try {
        const res = await fetch('/api/user/me')
        if (res.ok) {
          const data = await res.json()
          setUserState(data.user)
          setUser(data.user)
        } else {
          setUserState(null)
          clearUser()
        }
      } catch {
        // 网络错误保留缓存，不登出
      } finally {
        setLoading(false)
      }
    }
    fetchMe()
  }, [])

  const login = useCallback((u) => {
    setUserState(u)
    setUser(u)
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    setUserState(null)
    clearUser()
  }, [])

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/user/me')
      if (res.ok) {
        const data = await res.json()
        setUserState(data.user)
        setUser(data.user)
      }
    } catch {}
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
