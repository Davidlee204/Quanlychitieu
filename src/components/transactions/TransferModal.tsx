"use client"

import { useState } from "react"
import { X, ArrowDown, Loader2, ArrowLeftRight } from "lucide-react"
import { toast } from "sonner"
import type { Wallet } from "@prisma/client"
import { formatCurrency } from "@/lib/utils"

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

  const fromWallet = wallets.find(w => w.id === fromId)
  const toWallet = wallets.find(w => w.id === toId)

  const swap = () => {
    const tmp = fromId
    setFromId(toId)
    setToId(tmp)
  }

  const handleSubmit = async () => {
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) { toast.error("Số tiền không hợp lệ"); return }
    if (fromId === toId) { toast.error("Chọn 2 tài khoản khác nhau"); return }
    if (fromWallet && Number(fromWallet.balance) < amt) { toast.error("Số dư không đủ"); return }

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
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet">

        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 8px" }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: "var(--border-bright)" }} />
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px 28px" }}>
          <div>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: 20, fontWeight: 700,
              letterSpacing: "-0.01em",
            }}>
              Chuyển tiền
            </h2>
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
              Giữa các tài khoản của bạn
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 34, height: 34,
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--bg-elevated)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--text-secondary)",
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Transfer visual flow */}
          <div style={{
            background: "var(--bg-base)",
            borderRadius: "var(--r-md)",
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}>
            {/* From */}
            <div style={{ padding: "16px 18px" }}>
              <p className="label" style={{ marginBottom: 8 }}>Từ tài khoản</p>
              <select
                className="input"
                value={fromId}
                onChange={e => setFromId(e.target.value)}
                style={{ background: "var(--bg-elevated)" }}
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} — {Number(w.balance).toLocaleString("vi-VN")}đ
                  </option>
                ))}
              </select>
              {fromWallet && (
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                  Số dư: <span style={{ color: "var(--text-secondary)" }}>{formatCurrency(Number(fromWallet.balance))}</span>
                </p>
              )}
            </div>

            {/* Swap divider */}
            <div style={{
              display: "flex", alignItems: "center",
              padding: "0 18px",
              borderTop: "1px dashed var(--border)",
              borderBottom: "1px dashed var(--border)",
              position: "relative",
              height: 40,
            }}>
              <div style={{ flex: 1, height: 1, background: "transparent" }} />
              <button
                onClick={swap}
                style={{
                  position: "absolute", left: "50%",
                  transform: "translateX(-50%)",
                  width: 32, height: 32,
                  borderRadius: "50%",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-bright)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "var(--accent)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "var(--accent-dim)"
                  e.currentTarget.style.borderColor = "var(--border-accent)"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "var(--bg-elevated)"
                  e.currentTarget.style.borderColor = "var(--border-bright)"
                }}
                title="Đổi chiều"
              >
                <ArrowLeftRight size={14} />
              </button>
            </div>

            {/* To */}
            <div style={{ padding: "16px 18px" }}>
              <p className="label" style={{ marginBottom: 8 }}>Đến tài khoản</p>
              <select
                className="input"
                value={toId}
                onChange={e => setToId(e.target.value)}
                style={{ background: "var(--bg-elevated)" }}
              >
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} — {Number(w.balance).toLocaleString("vi-VN")}đ
                  </option>
                ))}
              </select>
              {toWallet && (
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                  Số dư: <span style={{ color: "var(--text-secondary)" }}>{formatCurrency(Number(toWallet.balance))}</span>
                </p>
              )}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="label">Số tiền</label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: 16, top: "50%",
                transform: "translateY(-50%)",
                fontSize: 20, fontWeight: 700,
                color: "var(--text-muted)",
                fontFamily: "var(--font-display)",
              }}>₫</span>
              <input
                className="input"
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                autoFocus
                style={{
                  paddingLeft: 36,
                  fontSize: 28,
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                  letterSpacing: "-0.02em",
                  height: 68,
                }}
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="label">Ghi chú (tuỳ chọn)</label>
            <input
              className="input"
              placeholder="Nạp tiền, rút tiền, chia sẻ..."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-ghost" onClick={onClose} style={{ flex: 1 }}>Huỷ</button>
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={loading}
              style={{ flex: 2 }}
            >
              {loading
                ? <><Loader2 size={15} style={{ animation: "spin-slow 0.8s linear infinite" }} />Đang xử lý...</>
                : "Xác nhận chuyển"
              }
            </button>
          </div>
        </div>
      </div>
    </>
  )
}