"use client"

import { useState } from "react"
import { X, ArrowDown, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Wallet } from "@prisma/client"

interface Props {
  wallets: Wallet[]
  onClose: () => void
  onSuccess: () => void
}

export default function TransferModal({ wallets, onClose, onSuccess }: Props) {
  const [fromId, setFromId] = useState(wallets[0]?.id || "")
  const [toId, setToId] = useState(wallets[1]?.id || wallets[0]?.id || "")
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!amount || fromId === toId) {
      toast.error(fromId === toId ? "Chọn 2 tài khoản khác nhau" : "Vui lòng nhập số tiền")
      return
    }
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) {
      toast.error("Số tiền không hợp lệ")
      return
    }
    const from = wallets.find((w) => w.id === fromId)
    if (from && Number(from.balance) < amt) {
      toast.error("Số dư tài khoản nguồn không đủ")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "TRANSFER", amount: amt, note, fromWalletId: fromId, toWalletId: toId }),
      })
      if (!res.ok) throw new Error()
      toast.success("Chuyển tiền thành công!")
      onSuccess()
    } catch {
      toast.error("Có lỗi xảy ra")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="bottom-sheet-overlay" onClick={onClose} />
      <div className="bottom-sheet">
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--border)" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px 20px" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Chuyển tiền</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: "0 20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* From */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>
              Từ tài khoản
            </label>
            <select className="input-field" value={fromId} onChange={(e) => setFromId(e.target.value)}>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>{w.name} — {Number(w.balance).toLocaleString("vi-VN")}đ</option>
              ))}
            </select>
          </div>

          {/* Arrow */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "var(--accent-light)", border: "2px solid var(--accent)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ArrowDown size={16} color="var(--accent)" />
            </div>
          </div>

          {/* To */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>
              Đến tài khoản
            </label>
            <select className="input-field" value={toId} onChange={(e) => setToId(e.target.value)}>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>{w.name} — {Number(w.balance).toLocaleString("vi-VN")}đ</option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>
              Số tiền
            </label>
            <input
              className="input-field"
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ fontSize: 24, fontWeight: 700, textAlign: "right" }}
              autoFocus
            />
          </div>

          {/* Note */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>
              Ghi chú (tuỳ chọn)
            </label>
            <input className="input-field" placeholder="Nạp tiền, rút tiền..." value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button className="btn-ghost" onClick={onClose}>Huỷ</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {loading ? <><Loader2 size={16} className="animate-spin" />Đang xử lý...</> : "Xác nhận"}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}