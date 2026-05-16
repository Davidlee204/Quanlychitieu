"use client"

import { useEffect, useState } from "react"
import { useSession, signIn } from "next-auth/react"
import Image from "next/image"
import {
  Wallet, Banknote, Smartphone, MoreHorizontal,
  Plus, ArrowLeftRight, TrendingDown, Chrome,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import BottomNav from "@/components/layout/BottomNav"
import ThemeToggle from "@/components/layout/ThemeToggle"
import ExpenseModal from "@/components/transactions/ExpenseModal"
import TransferModal from "@/components/transactions/TransferModal"
import type { Wallet as WalletType } from "@prisma/client"

const walletIcons: Record<string, React.ElementType> = {
  cash: Banknote,
  bank: Wallet,
  ewallet: Smartphone,
  other: MoreHorizontal,
}

const walletTypeLabel: Record<string, string> = {
  CASH: "Tiền mặt",
  BANK: "Ngân hàng",
  EWALLET: "Ví điện tử",
  OTHER: "Khác",
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [wallets, setWallets] = useState<WalletType[]>([])
  const [loading, setLoading] = useState(true)
  const [showExpense, setShowExpense] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)

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

  const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0)

  // ── Login screen ─────────────────────────────────────────────────
  if (status === "loading") return <LoadingSkeleton />

  if (!session) {
    return (
      <div style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
        gap: 32,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <TrendingDown size={36} color="#fff" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Chi Tiêu</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
            Quản lý tài chính cá nhân đơn giản
          </p>
        </div>

        <button
          onClick={() => signIn("google")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 28px",
            borderRadius: 14,
            background: "var(--bg-card)",
            border: "1.5px solid var(--border)",
            cursor: "pointer",
            fontSize: 15,
            fontWeight: 600,
            color: "var(--text-primary)",
            boxShadow: "var(--shadow-md)",
            width: "100%",
            maxWidth: 320,
            justifyContent: "center",
          }}
        >
          <Chrome size={20} color="#4285F4" />
          Đăng nhập với Google
        </button>
      </div>
    )
  }

  // ── Main dashboard ────────────────────────────────────────────────
  return (
    <>
      <div style={{ minHeight: "100dvh", paddingBottom: "calc(var(--nav-height) + 24px)" }}>

        {/* Header */}
        <header style={{
          padding: "56px 20px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {session.user?.image && (
              <Image
                src={session.user.image}
                alt="avatar"
                width={36}
                height={36}
                style={{ borderRadius: "50%", border: "2px solid var(--border)" }}
              />
            )}
            <div>
              <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Xin chào 👋</p>
              <p style={{ fontSize: 14, fontWeight: 600 }}>{session.user?.name?.split(" ").pop()}</p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        {/* Total Balance Card */}
        <div style={{ padding: "0 20px 20px" }}>
          <div style={{
            background: "var(--accent)",
            borderRadius: 20,
            padding: "28px 24px",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Decorative circle */}
            <div style={{
              position: "absolute", top: -30, right: -30,
              width: 140, height: 140, borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
            }} />
            <div style={{
              position: "absolute", bottom: -20, right: 40,
              width: 80, height: 80, borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
            }} />
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginBottom: 8 }}>
              Tổng số dư
            </p>
            <p style={{ color: "#fff", fontSize: 32, fontWeight: 700, letterSpacing: -1 }}>
              {loading ? "---" : formatCurrency(totalBalance)}
            </p>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 8 }}>
              {wallets.length} tài khoản
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ padding: "0 20px 24px", display: "flex", gap: 12 }}>
          <button
            onClick={() => setShowExpense(true)}
            style={{
              flex: 1, padding: "14px 0",
              borderRadius: 14, border: "none",
              background: "var(--accent)", color: "#fff",
              fontSize: 14, fontWeight: 600,
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            <Plus size={18} strokeWidth={2.5} />
            Thêm chi tiêu
          </button>
          <button
            onClick={() => setShowTransfer(true)}
            style={{
              flex: 1, padding: "14px 0",
              borderRadius: 14,
              border: "1.5px solid var(--border)",
              background: "var(--bg-card)", color: "var(--text-primary)",
              fontSize: 14, fontWeight: 600,
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            <ArrowLeftRight size={16} />
            Chuyển tiền
          </button>
        </div>

        {/* Wallet List */}
        <div style={{ padding: "0 20px" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Tài khoản
          </p>

          {loading ? (
            <WalletSkeleton />
          ) : wallets.length === 0 ? (
            <EmptyWallets />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {wallets.map((wallet) => {
                const Icon = walletIcons[wallet.icon] || Wallet
                return (
                  <div key={wallet.id} className="card" style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: wallet.color + "22",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <Icon size={20} color={wallet.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{wallet.name}</p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{walletTypeLabel[wallet.type]}</p>
                    </div>
                    <p style={{
                      fontSize: 16, fontWeight: 700,
                      color: Number(wallet.balance) >= 0 ? "var(--text-primary)" : "var(--red)",
                    }}>
                      {formatCurrency(Number(wallet.balance))}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
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
    </>
  )
}

function WalletSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="card" style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--border)", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 14, width: "60%", background: "var(--border)", borderRadius: 6, marginBottom: 8 }} />
            <div style={{ height: 11, width: "35%", background: "var(--border)", borderRadius: 6 }} />
          </div>
          <div style={{ height: 16, width: 80, background: "var(--border)", borderRadius: 6 }} />
        </div>
      ))}
    </div>
  )
}

function EmptyWallets() {
  return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <div style={{
        width: 60, height: 60, borderRadius: 16,
        background: "var(--accent-light)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 16px",
      }}>
        <Wallet size={28} color="var(--accent)" />
      </div>
      <p style={{ fontWeight: 600, marginBottom: 6 }}>Chưa có tài khoản</p>
      <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Seed dữ liệu để bắt đầu</p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div style={{ padding: "56px 20px 0" }}>
      <div style={{ height: 36, width: 120, background: "var(--border)", borderRadius: 10, marginBottom: 24 }} />
      <div style={{ height: 120, borderRadius: 20, background: "var(--border)", marginBottom: 20 }} />
    </div>
  )
}