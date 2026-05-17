"use client"

import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div style={{ width: 36, height: 36 }} />

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        border: "1px solid var(--border-bright)",
        background: "var(--bg-elevated)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "var(--text-secondary)",
        transition: "all 0.15s",
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "var(--border-accent)"
        e.currentTarget.style.color = "var(--accent)"
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "var(--border-bright)"
        e.currentTarget.style.color = "var(--text-secondary)"
      }}
      title={isDark ? "Chế độ sáng" : "Chế độ tối"}
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  )
}