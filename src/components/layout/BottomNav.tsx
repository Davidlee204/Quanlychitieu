"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Clock } from "lucide-react"

const tabs = [
  { href: "/", icon: LayoutDashboard, label: "Tổng quan" },
  { href: "/history", icon: Clock, label: "Lịch sử" },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "var(--nav-height)",
        background: "var(--bg-card)",
        borderTop: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        zIndex: 40,
        paddingBottom: "env(safe-area-inset-bottom, 8px)",
      }}
    >
      {tabs.map(({ href, icon: Icon, label }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "8px 24px",
              borderRadius: 12,
              textDecoration: "none",
              color: active ? "var(--accent)" : "var(--text-muted)",
              transition: "color 0.15s",
              minWidth: 80,
            }}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span style={{ fontSize: 11, fontWeight: active ? 600 : 400 }}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}