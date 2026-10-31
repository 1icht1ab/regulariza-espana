import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [oscuro, setOscuro] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', oscuro)
  }, [oscuro])

  const alternar = () => {
    setOscuro((v) => {
      try { localStorage.setItem('re-tema', v ? 'claro' : 'oscuro') } catch { /* sin almacenamiento */ }
      return !v
    })
  }

  return <ThemeContext.Provider value={{ oscuro, alternar }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
