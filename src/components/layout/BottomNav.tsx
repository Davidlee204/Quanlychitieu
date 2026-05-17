"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Clock } from "lucide-react"

const tabs = [
  { href: "/",        icon: LayoutDashboard, label: "Tổng quan" },
  { href: "/history", icon: Clock,           label: "Lịch sử"   },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="bottom-nav">
      {tabs.map(({ href, icon: Icon, label }) => {
        const active = pathname === href

        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              padding: "8px 12px",
              borderRadius: 16,
              textDecoration: "none",
              position: "relative",
              transition: "all 0.2s",
            }}
          >
            {/* Active pill background */}
            {active && (
              <div style={{
                position: "absolute",
                inset: 0,
                borderRadius: 16,
                background: "var(--accent-dim)",
                border: "1px solid var(--border-accent)",
                boxShadow: "var(--accent-glow)",
              }} />
            )}

            {/* Icon */}
            <div style={{ position: "relative", zIndex: 1 }}>
              <Icon
                size={20}
                strokeWidth={active ? 2.5 : 1.8}
                color={active ? "var(--accent)" : "var(--text-muted)"}
                style={{ transition: "all 0.2s" }}
              />
            </div>

            {/* Label */}
            <span style={{
              position: "relative",
              zIndex: 1,
              fontSize: 10,
              fontWeight: active ? 700 : 400,
              letterSpacing: active ? "0.04em" : 0,
              color: active ? "var(--accent)" : "var(--text-muted)",
              transition: "all 0.2s",
              textTransform: active ? "uppercase" : "none",
            }}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}