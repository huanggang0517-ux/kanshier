export function getUser() {
  if (typeof window === 'undefined') return null
  try {
    const data = localStorage.getItem('user')
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user))
}

export function clearUser() {
  localStorage.removeItem('user')
}
