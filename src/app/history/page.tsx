"use client"

import { useEffect, useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import {
  ArrowLeftRight, TrendingDown, Trash2,
  Search, X, Clock,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import BottomNav from "@/components/layout/BottomNav"
import ThemeToggle from "@/components/layout/ThemeToggle"
import ImageViewer from "@/components/ui/ImageViewer"
import Image from "next/image"
import type { TransactionWithWallets } from "@/types"

type Filter = "ALL" | "EXPENSE" | "TRANSFER"

function groupByDate(txns: TransactionWithWallets[]) {
  const groups: Record<string, TransactionWithWallets[]> = {}
  txns.forEach((t) => {
    const d = new Date(t.createdAt)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    let key: string
    if (d.toDateString() === today.toDateString()) key = "Hôm nay"
    else if (d.toDateString() === yesterday.toDateString()) key = "Hôm qua"
    else key = d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    if (!groups[key]) groups[key] = []
    groups[key].push(t)
  })
  return groups
}

/* ── Transaction Item ────────────────────────────────────────────── */
function TxnItem({
  txn, onDelete, deleting,
}: {
  txn: TransactionWithWallets
  onDelete: () => void
  deleting: boolean
}) {
  const [viewImg, setViewImg] = useState(false)
  const isTransfer = txn.type === "TRANSFER"
  const color = isTransfer ? "var(--accent)" : "var(--red)"
  const bgColor = isTransfer ? "var(--accent-dim)" : "var(--red-dim)"
  const time = new Date(txn.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })

  return (
    <>
      <div className="txn-item" style={{ position: "relative" }}>
        {/* ── Icon hoặc ảnh hoá đơn ── */}
        {txn.imageUrl ? (
          <div
            onClick={(e) => { e.stopPropagation(); setViewImg(true) }}
            style={{
              position: "relative",
              flexShrink: 0,
              cursor: "zoom-in",
              width: 46, height: 46,
            }}
          >
            <Image
              src={txn.imageUrl}
              alt="receipt"
              width={46}
              height={46}
              style={{
                width: 46, height: 46,
                borderRadius: 12,
                objectFit: "cover",
                border: "1.5px solid var(--border-bright)",
              }}
              unoptimized
            />
            {/* Zoom overlay */}
            <div style={{
              position: "absolute", inset: 0,
              borderRadius: 12,
              background: "rgba(0,212,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: 0,
              transition: "opacity 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "1" }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "0" }}
            >
              <Search size={14} color="var(--accent)" />
            </div>
            {/* Badge */}
            <div style={{
              position: "absolute", bottom: -3, right: -3,
              width: 18, height: 18,
              borderRadius: "50%",
              background: isTransfer ? "var(--accent)" : "var(--red)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid var(--bg-surface)",
            }}>
              {isTransfer
                ? <ArrowLeftRight size={9} color="#000" />
                : <TrendingDown size={9} color="#000" />
              }
            </div>
          </div>
        ) : (
          <div style={{
            width: 46, height: 46,
            borderRadius: 12,
            background: bgColor,
            border: `1px solid ${color}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            {isTransfer
              ? <ArrowLeftRight size={18} color={color} />
              : <TrendingDown size={18} color={color} />
            }
          </div>
        )}

        {/* ── Nội dung ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 14, fontWeight: 600,
            color: "var(--text-primary)",
            marginBottom: 3,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {txn.note || (isTransfer ? "Chuyển tiền" : "Chi tiêu")}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
              {isTransfer
                ? `${txn.fromWallet.name} → ${txn.toWallet?.name}`
                : txn.fromWallet.name}
            </span>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--text-muted)", flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{time}</span>
            {/* Badge ảnh */}
            {txn.imageUrl && (
              <span style={{
                fontSize: 10, fontWeight: 600,
                padding: "1px 6px", borderRadius: 100,
                background: "var(--accent-dim)",
                color: "var(--accent)",
                border: "1px solid var(--border-accent)",
              }}>
                📎 Ảnh
              </span>
            )}
          </div>
        </div>

        {/* ── Số tiền + xoá ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
          <p style={{
            fontFamily: "var(--font-display)",
            fontSize: 15, fontWeight: 700,
            color,
          }}>
            {isTransfer ? "↔ " : "− "}{formatCurrency(Number(txn.amount))}
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            disabled={deleting}
            style={{
              background: "none", border: "none",
              cursor: deleting ? "not-allowed" : "pointer",
              color: "var(--text-muted)",
              padding: 4,
              opacity: deleting ? 0.3 : 0.6,
              transition: "opacity 0.15s, color 0.15s",
              display: "flex",
            }}
            onMouseEnter={e => { if (!deleting) e.currentTarget.style.color = "var(--red)" }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)" }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* ── Image viewer fullscreen ── */}
      {viewImg && txn.imageUrl && (
        <ImageViewer url={txn.imageUrl} onClose={() => setViewImg(false)} />
      )}
    </>
  )
}

/* ── Filter Pill ─────────────────────────────────────────────────── */
function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "7px 16px",
        borderRadius: 100,
        border: active ? "1px solid var(--border-accent)" : "1px solid var(--border)",
        background: active ? "var(--accent-dim)" : "transparent",
        color: active ? "var(--accent)" : "var(--text-secondary)",
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
        fontFamily: "var(--font-body)",
      }}
    >
      {label}
    </button>
  )
}

/* ── Empty ───────────────────────────────────────────────────────── */
function EmptyHistory({ filtered }: { filtered: boolean }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 24px" }}>
      <div style={{
        width: 68, height: 68, borderRadius: 20,
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-bright)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 18px",
      }}>
        <Clock size={28} color="var(--text-muted)" />
      </div>
      <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
        {filtered ? "Không tìm thấy giao dịch" : "Chưa có giao dịch nào"}
      </p>
      <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
        {filtered ? "Thử thay đổi bộ lọc hoặc tìm kiếm" : "Về Dashboard và thêm chi tiêu đầu tiên"}
      </p>
    </div>
  )
}

/* ── Skeleton ────────────────────────────────────────────────────── */
function HistorySkeleton() {
  return (
    <div style={{ padding: "0 20px" }}>
      {[1, 2].map(g => (
        <div key={g} style={{ marginBottom: 28 }}>
          <div className="skeleton" style={{ height: 12, width: 80, marginBottom: 14, borderRadius: 6 }} />
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 0",
              borderBottom: "1px solid var(--border)",
            }}>
              <div className="skeleton" style={{ width: 46, height: 46, borderRadius: 12, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 14, width: "55%", marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 11, width: "40%" }} />
              </div>
              <div className="skeleton" style={{ height: 15, width: 70 }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

/* ── History Page ────────────────────────────────────────────────── */
export default function HistoryPage() {
  const { data: session, status } = useSession()
  const [transactions, setTransactions] = useState<TransactionWithWallets[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<Filter>("ALL")
  const [search, setSearch] = useState("")
  const [showSearch, setShowSearch] = useState(false)

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
      setTransactions(prev => prev.filter(t => t.id !== id))
      toast.success("Đã xoá giao dịch")
    } catch {
      toast.error("Xoá thất bại")
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const matchFilter = filter === "ALL" || t.type === filter
      const matchSearch = !search
        || (t.note?.toLowerCase().includes(search.toLowerCase()) ?? false)
        || t.fromWallet.name.toLowerCase().includes(search.toLowerCase())
      return matchFilter && matchSearch
    })
  }, [transactions, filter, search])

  const totalExpense = filtered
    .filter(t => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const grouped = groupByDate(filtered)
  const dates = Object.keys(grouped)

  if (status === "loading" || loading) return (
    <>
      <div style={{ padding: "56px 20px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="skeleton" style={{ height: 26, width: 100, marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 13, width: 60 }} />
        </div>
        <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 10 }} />
      </div>
      <HistorySkeleton />
      <BottomNav />
    </>
  )

  return (
    <>
      <div style={{ minHeight: "100dvh" }} className="pb-nav">

        {/* Header */}
        <header style={{
          padding: "56px 20px 20px",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        }}>
          <div>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: 26, fontWeight: 800,
              letterSpacing: "-0.02em", marginBottom: 4,
            }}>
              Lịch sử
            </h1>
            {totalExpense > 0 && (
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Chi tiêu: <span style={{ color: "var(--red)", fontWeight: 600 }}>{formatCurrency(totalExpense)}</span>
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => { setShowSearch(!showSearch); if (showSearch) setSearch("") }}
              style={{
                width: 36, height: 36, borderRadius: 10,
                border: showSearch ? "1px solid var(--border-accent)" : "1px solid var(--border)",
                background: showSearch ? "var(--accent-dim)" : "var(--bg-elevated)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
                color: showSearch ? "var(--accent)" : "var(--text-secondary)",
              }}
            >
              <Search size={15} />
            </button>
            <ThemeToggle />
          </div>
        </header>

        <div style={{ padding: "0 20px" }}>

          {/* Search */}
          {showSearch && (
            <div style={{ position: "relative", marginBottom: 16 }}>
              <Search size={15} color="var(--text-muted)" style={{
                position: "absolute", left: 14, top: "50%",
                transform: "translateY(-50%)", pointerEvents: "none",
              }} />
              <input
                className="input"
                placeholder="Tìm theo nội dung, tài khoản..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
                style={{ paddingLeft: 40, paddingRight: search ? 40 : 16 }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none",
                    cursor: "pointer", color: "var(--text-muted)", display: "flex",
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {/* Filter pills */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
            {(["ALL", "EXPENSE", "TRANSFER"] as Filter[]).map(f => (
              <FilterPill
                key={f}
                label={f === "ALL" ? "Tất cả" : f === "EXPENSE" ? "Chi tiêu" : "Chuyển tiền"}
                active={filter === f}
                onClick={() => setFilter(f)}
              />
            ))}
          </div>

          {/* List */}
          {dates.length === 0 ? (
            <EmptyHistory filtered={filter !== "ALL" || !!search} />
          ) : (
            dates.map(date => {
              const dayTxns = grouped[date]
              const dayTotal = dayTxns
                .filter(t => t.type === "EXPENSE")
                .reduce((s, t) => s + Number(t.amount), 0)

              return (
                <div key={date} style={{ marginBottom: 28 }}>
                  {/* Sticky date header */}
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginBottom: 6,
                    position: "sticky", top: 0,
                    background: "var(--bg-base)",
                    padding: "8px 0",
                    zIndex: 10,
                  }}>
                    <span style={{
                      fontSize: 12, fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                    }}>
                      {date}
                    </span>
                    {dayTotal > 0 && (
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--red)" }}>
                        −{formatCurrency(dayTotal)}
                      </span>
                    )}
                  </div>

                  {/* Items grouped in card */}
                  <div style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--r-md)",
                    overflow: "hidden",
                  }}>
                    {dayTxns.map((txn, i) => (
                      <div key={txn.id} style={{
                        borderBottom: i < dayTxns.length - 1 ? "1px solid var(--border)" : "none",
                      }}>
                        <TxnItem
                          txn={txn}
                          deleting={deletingId === txn.id}
                          onDelete={() => handleDelete(txn.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
      <BottomNav />
    </>
  )
}