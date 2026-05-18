"use client"

import { useEffect, useState } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import Image from "next/image"
import {
  Banknote, Wallet, Smartphone, MoreHorizontal,
  Plus, ArrowLeftRight, TrendingDown, Eye, EyeOff,
  Sparkles, ChevronRight, LogOut,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import BottomNav from "@/components/layout/BottomNav"
import ThemeToggle from "@/components/layout/ThemeToggle"
import ExpenseModal from "@/components/transactions/ExpenseModal"
import TransferModal from "@/components/transactions/TransferModal"
import WalletCreateModal from "@/components/wallets/WalletCreateModal"
import WalletEditModal from "@/components/wallets/WalletEditModal"
import type { Wallet as WalletType } from "@prisma/client"

/* ── Wallet meta ─────────────────────────────────────────────────── */
const walletMeta: Record<string, { icon: React.ElementType; color: string; glow: string }> = {
  cash:    { icon: Banknote,       color: "#00e5a0", glow: "#00e5a0" },
  bank:    { icon: Wallet,         color: "#00d4ff", glow: "#00d4ff" },
  ewallet: { icon: Smartphone,     color: "#a78bfa", glow: "#a78bfa" },
  other:   { icon: MoreHorizontal, color: "#ffb340", glow: "#ffb340" },
}

const walletTypeLabel: Record<string, string> = {
  CASH: "Tiền mặt", BANK: "Ngân hàng", EWALLET: "Ví điện tử", OTHER: "Khác",
}

/* ── Login page ──────────────────────────────────────────────────── */
function LoginPage() {
  return (
    <div style={{
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 28px",
      position: "relative",
    }}>
      {/* Background glow */}
      <div style={{
        position: "fixed", top: "20%", left: "50%",
        transform: "translateX(-50%)",
        width: 400, height: 400,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <div style={{
          width: 80, height: 80,
          borderRadius: 24,
          background: "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,229,160,0.1))",
          border: "1px solid rgba(0,212,255,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
          boxShadow: "0 0 40px rgba(0,212,255,0.12)",
          animation: "float 3s ease-in-out infinite",
        }}>
          <TrendingDown size={36} color="var(--accent)" />
        </div>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: 36,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          background: "linear-gradient(135deg, #f0f4f8 0%, #7a90a8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: 10,
        }}>
          Chi Tiêu
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 15, lineHeight: 1.6 }}>
          Quản lý tài chính cá nhân<br />đơn giản và hiệu quả
        </p>
      </div>

      {/* Sign in */}
      <button
        onClick={() => signIn("google")}
        style={{
          width: "100%", maxWidth: 320,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
          padding: "16px 28px",
          borderRadius: "var(--r-md)",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-bright)",
          cursor: "pointer",
          fontSize: 15,
          fontWeight: 600,
          color: "var(--text-primary)",
          fontFamily: "var(--font-body)",
          transition: "all 0.2s",
          boxShadow: "var(--shadow-md)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--border-accent)"
          e.currentTarget.style.boxShadow = "var(--shadow-md), var(--accent-glow)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border-bright)"
          e.currentTarget.style.boxShadow = "var(--shadow-md)"
        }}
      >
        {/* Google icon */}
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Đăng nhập với Google
      </button>

      <p style={{ marginTop: 24, fontSize: 12, color: "var(--text-muted)", textAlign: "center" }}>
        Dữ liệu của bạn được mã hoá và bảo mật
      </p>
    </div>
  )
}

/* ── Hero Balance Card ───────────────────────────────────────────── */
function HeroCard({ total, count, loading }: { total: number; count: number; loading: boolean }) {
  const [hidden, setHidden] = useState(false)
  const now = new Date()
  const month = now.toLocaleDateString("vi-VN", { month: "long", year: "numeric" })

  return (
    <div className="hero-card" style={{ marginBottom: 20 }}>
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}>
            Tổng số dư
          </span>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{month}</p>
        </div>
        <button
          onClick={() => setHidden(!hidden)}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            width: 36, height: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "var(--text-secondary)",
            transition: "all 0.15s",
          }}
        >
          {hidden ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>

      {/* Amount */}
      <div style={{ marginBottom: 28 }}>
        {loading ? (
          <div className="skeleton" style={{ height: 48, width: "60%", borderRadius: 10 }} />
        ) : (
          <p style={{
            fontFamily: "var(--font-display)",
            fontSize: 42,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "var(--text-primary)",
            lineHeight: 1,
          }}>
            {hidden ? "••••••••" : formatCurrency(total)}
          </p>
        )}
      </div>

      {/* Footer */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 18,
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Sparkles size={13} color="var(--accent)" />
          <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            {count} tài khoản đang hoạt động
          </span>
        </div>
        <div style={{
          padding: "4px 10px",
          borderRadius: 100,
          background: "var(--green-dim)",
          border: "1px solid rgba(0,229,160,0.2)",
        }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--green)" }}>Ổn định</span>
        </div>
      </div>
    </div>
  )
}

/* ── Wallet Card ─────────────────────────────────────────────────── */
function WalletCard({ wallet, onEdit }: { wallet: WalletType; onEdit: () => void }) {
  const meta = walletMeta[wallet.icon] || walletMeta.other
  const Icon = meta.icon
  const balance = Number(wallet.balance)

  return (
    <div className="wallet-card" style={{
      backgroundImage: `radial-gradient(ellipse at top right, ${meta.glow}08 0%, transparent 60%)`,
      cursor: "pointer",
    }} onClick={onEdit}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Icon */}
        <div style={{
          width: 46, height: 46,
          borderRadius: 14,
          background: `${meta.color}15`,
          border: `1px solid ${meta.color}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          boxShadow: `0 0 16px ${meta.color}12`,
        }}>
          <Icon size={20} color={meta.color} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2, color: "var(--text-primary)" }}>
            {wallet.name}
          </p>
          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {walletTypeLabel[wallet.type]}
          </p>
        </div>

        {/* Balance + arrow */}
        <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: 10 }}>
          <p style={{
            fontFamily: "var(--font-display)",
            fontSize: 16, fontWeight: 700,
            color: balance < 0 ? "var(--red)" : "var(--text-primary)",
          }}>
            {formatCurrency(balance)}
          </p>
          <ChevronRight size={14} color="var(--text-muted)" />
        </div>
      </div>
    </div>
  )
}

/* ── Wallet Skeleton ─────────────────────────────────────────────── */
function WalletSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {[1,2,3].map(i => (
        <div key={i} style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-md)",
          padding: "18px 20px",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <div className="skeleton" style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 14, width: "55%", marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 11, width: "30%" }} />
          </div>
          <div className="skeleton" style={{ height: 16, width: 80 }} />
        </div>
      ))}
    </div>
  )
}

/* ── Empty State ─────────────────────────────────────────────────── */
function EmptyWallets({ onCreateWallet }: { onCreateWallet: () => void }) {
  return (
    <div style={{
      textAlign: "center",
      padding: "48px 24px",
      border: "1px dashed var(--border-bright)",
      borderRadius: "var(--r-lg)",
    }}>
      <div style={{
        width: 64, height: 64,
        borderRadius: 18,
        background: "var(--accent-dim)",
        border: "1px solid var(--border-accent)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 16px",
        animation: "float 3s ease-in-out infinite",
      }}>
        <Wallet size={28} color="var(--accent)" />
      </div>
      <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Chưa có tài khoản nào</p>
      <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 20 }}>
        Tạo tài khoản mới để bắt đầu<br />quản lý chi tiêu
      </p>
      <button
        onClick={onCreateWallet}
        className="btn-primary"
        style={{ width: "100%", justifyContent: "center" }}
      >
        <Plus size={16} /> Tạo tài khoản
      </button>
    </div>
  )
}

/* ── Dashboard ───────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [wallets, setWallets] = useState<WalletType[]>([])
  const [loading, setLoading] = useState(true)
  const [showExpense, setShowExpense] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [showCreateWallet, setShowCreateWallet] = useState(false)
  const [editingWallet, setEditingWallet] = useState<WalletType | null>(null)

  const fetchWallets = async () => {
    try {
      const res = await fetch("/api/wallets")
      if (res.ok) setWallets(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) fetchWallets()
    else if (status !== "loading") setLoading(false)
  }, [session, status])

  if (status === "loading") return (
    <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{
        width: 40, height: 40,
        border: "2px solid var(--border)",
        borderTopColor: "var(--accent)",
        borderRadius: "50%",
        animation: "spin-slow 0.8s linear infinite",
      }} />
    </div>
  )

  if (!session) return <LoginPage />

  const total = wallets.reduce((s, w) => s + Number(w.balance), 0)
  const firstName = session.user?.name?.split(" ").pop() || "bạn"

  return (
    <>
      <div style={{ minHeight: "100dvh" }} className="pb-nav">

        {/* ── Header ── */}
        <header style={{ padding: "56px 20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {session.user?.image ? (
              <div style={{
                width: 40, height: 40,
                borderRadius: "50%",
                border: "2px solid var(--border-accent)",
                overflow: "hidden",
                boxShadow: "0 0 12px rgba(0,212,255,0.2)",
              }}>
                <Image src={session.user.image} alt="avatar" width={40} height={40} />
              </div>
            ) : (
              <div style={{
                width: 40, height: 40,
                borderRadius: "50%",
                background: "var(--accent-dim)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: "var(--accent)" }}>
                  {firstName[0]}
                </span>
              </div>
            )}
            <div>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Xin chào 👋</p>
              <p style={{
                fontFamily: "var(--font-display)",
                fontSize: 16, fontWeight: 700,
                color: "var(--text-primary)",
              }}>
                {firstName}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ThemeToggle />
            <button
              onClick={() => signOut()}
              style={{
                width: 36, height: 36,
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "var(--bg-elevated)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "var(--text-secondary)",
                transition: "all 0.15s",
              }}
              title="Đăng xuất"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <div style={{ padding: "0 20px" }}>

          {/* ── Hero Card ── */}
          <HeroCard total={total} count={wallets.length} loading={loading} />

          {/* ── Action buttons ── */}
          <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
            <button
              onClick={() => setShowExpense(true)}
              className="btn-primary"
              style={{ flex: 1 }}
            >
              <Plus size={17} strokeWidth={2.5} />
              Thêm chi tiêu
            </button>
            <button
              onClick={() => setShowTransfer(true)}
              className="btn-ghost"
              style={{ flex: 1 }}
            >
              <ArrowLeftRight size={15} />
              Chuyển tiền
            </button>
          </div>

          {/* ── Wallets section ── */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span className="label" style={{ margin: 0 }}>Tài khoản</span>
              <button
                onClick={() => setShowCreateWallet(true)}
                style={{
                  fontSize: 12, color: "var(--accent)", cursor: "pointer",
                  background: "none", border: "none", fontWeight: 600,
                  padding: 0, textDecoration: "underline",
                }}
              >
                + Tạo mới
              </button>
            </div>

            {loading ? (
              <WalletSkeleton />
            ) : wallets.length === 0 ? (
              <EmptyWallets onCreateWallet={() => setShowCreateWallet(true)} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {wallets.map(w => (
                  <WalletCard
                    key={w.id}
                    wallet={w}
                    onEdit={() => setEditingWallet(w)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNav />

      {showExpense && (
        <ExpenseModal
          wallets={wallets}
          onClose={() => setShowExpense(false)}
          onSuccess={() => { setShowExpense(false); fetchWallets() }}
        />
      )}
      {showTransfer && (
        <TransferModal
          wallets={wallets}
          onClose={() => setShowTransfer(false)}
          onSuccess={() => { setShowTransfer(false); fetchWallets() }}
        />
      )}
      {showCreateWallet && (
        <WalletCreateModal
          onClose={() => setShowCreateWallet(false)}
          onSuccess={() => { setShowCreateWallet(false); fetchWallets() }}
        />
      )}
      {editingWallet && (
        <WalletEditModal
          wallet={editingWallet}
          onClose={() => setEditingWallet(null)}
          onSuccess={() => { setEditingWallet(null); fetchWallets() }}
        />
      )}
    </>
  )
}