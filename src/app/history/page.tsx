"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { ArrowLeftRight, TrendingDown, Trash2, Clock } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import BottomNav from "@/components/layout/BottomNav"
import ThemeToggle from "@/components/layout/ThemeToggle"
import Image from "next/image"
import type { TransactionWithWallets } from "@/types"

// Group giao dịch theo ngày
function groupByDate(txns: TransactionWithWallets[]) {
  const groups: Record<string, TransactionWithWallets[]> = {}
  txns.forEach((t) => {
    const key = new Date(t.createdAt).toLocaleDateString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
    })
    if (!groups[key]) groups[key] = []
    groups[key].push(t)
  })
  return groups
}

export default function HistoryPage() {
  const { data: session, status } = useSession()
  const [transactions, setTransactions] = useState<TransactionWithWallets[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/transactions?limit=100")
      if (res.ok) setTransactions(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session) fetchTransactions()
    else if (status !== "loading") setLoading(false)
  }, [session, status])

  const handleDelete = async (id: string) => {
    if (!confirm("Xoá giao dịch này? Số dư sẽ được hoàn lại.")) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setTransactions((prev) => prev.filter((t) => t.id !== id))
      toast.success("Đã xoá giao dịch")
    } catch {
      toast.error("Xoá thất bại")
    } finally {
      setDeletingId(null)
    }
  }

  if (status === "loading" || loading) return <HistorySkeleton />

  const grouped = groupByDate(transactions)
  const dates = Object.keys(grouped)

  return (
    <>
      <div style={{ minHeight: "100dvh", paddingBottom: "calc(var(--nav-height) + 24px)" }}>
        {/* Header */}
        <header style={{ padding: "56px 20px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>Lịch sử</h1>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
              {transactions.length} giao dịch
            </p>
          </div>
          <ThemeToggle />
        </header>

        {transactions.length === 0 ? (
          <EmptyHistory />
        ) : (
          <div style={{ padding: "0 20px" }}>
            {dates.map((date) => {
              const dayTxns = grouped[date]
              const dayTotal = dayTxns
                .filter((t) => t.type === "EXPENSE")
                .reduce((sum, t) => sum + Number(t.amount), 0)

              return (
                <div key={date} style={{ marginBottom: 24 }}>
                  {/* Date header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>{date}</p>
                    {dayTotal > 0 && (
                      <p style={{ fontSize: 13, color: "var(--red)", fontWeight: 600 }}>
                        -{formatCurrency(dayTotal)}
                      </p>
                    )}
                  </div>

                  {/* Transaction items */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {dayTxns.map((txn) => (
                      <TransactionItem
                        key={txn.id}
                        txn={txn}
                        deleting={deletingId === txn.id}
                        onDelete={() => handleDelete(txn.id)}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </>
  )
}

function TransactionItem({
  txn, deleting, onDelete,
}: {
  txn: TransactionWithWallets
  deleting: boolean
  onDelete: () => void
}) {
  const isTransfer = txn.type === "TRANSFER"

  return (
    <div className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
      {/* Icon or image */}
      {txn.imageUrl ? (
        <Image
          src={txn.imageUrl}
          alt="receipt"
          width={44}
          height={44}
          style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
        />
      ) : (
        <div style={{
          width: 44, height: 44, borderRadius: 10, flexShrink: 0,
          background: isTransfer ? "var(--accent-light)" : "var(--red-light)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {isTransfer
            ? <ArrowLeftRight size={18} color="var(--accent)" />
            : <TrendingDown size={18} color="var(--red)" />
          }
        </div>
      )}

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {txn.note || (isTransfer ? "Chuyển tiền" : "Chi tiêu")}
        </p>
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {isTransfer
            ? `${txn.fromWallet.name} → ${txn.toWallet?.name}`
            : txn.fromWallet.name}
        </p>
        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
          {new Date(txn.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      {/* Amount + Delete */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
        <p style={{
          fontSize: 15, fontWeight: 700,
          color: isTransfer ? "var(--accent)" : "var(--red)",
        }}>
          {isTransfer ? "" : "-"}{formatCurrency(Number(txn.amount))}
        </p>
        <button
          onClick={onDelete}
          disabled={deleting}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", padding: 4,
            opacity: deleting ? 0.4 : 1,
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

function EmptyHistory() {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div style={{
        width: 64, height: 64, borderRadius: 18,
        background: "var(--bg-card)", border: "1.5px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 16px",
      }}>
        <Clock size={28} color="var(--text-muted)" />
      </div>
      <p style={{ fontWeight: 600, marginBottom: 6 }}>Chưa có giao dịch nào</p>
      <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Về Dashboard và thêm chi tiêu đầu tiên</p>
    </div>
  )
}

function HistorySkeleton() {
  return (
    <div style={{ padding: "56px 20px 0" }}>
      <div style={{ height: 28, width: 100, background: "var(--border)", borderRadius: 8, marginBottom: 24 }} />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="card" style={{ padding: "14px 16px", display: "flex", gap: 12, marginBottom: 8 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--border)", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 14, width: "55%", background: "var(--border)", borderRadius: 6, marginBottom: 8 }} />
            <div style={{ height: 11, width: "35%", background: "var(--border)", borderRadius: 6 }} />
          </div>
          <div style={{ height: 15, width: 70, background: "var(--border)", borderRadius: 6 }} />
        </div>
      ))}
    </div>
  )
}