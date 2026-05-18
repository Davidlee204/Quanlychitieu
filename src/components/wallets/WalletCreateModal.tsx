"use client"

import { useState } from "react"
import { X, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Props {
  onClose: () => void
  onSuccess: () => void
}

const walletTypes = [
  { value: "CASH", label: "Tiền mặt" },
  { value: "BANK", label: "Ngân hàng" },
  { value: "EWALLET", label: "Ví điện tử" },
  { value: "OTHER", label: "Khác" },
]

const walletIcons = [
  { value: "cash", label: "💵" },
  { value: "bank", label: "🏦" },
  { value: "ewallet", label: "📱" },
  { value: "other", label: "⚙️" },
]

export default function WalletCreateModal({ onClose, onSuccess }: Props) {
  const [name, setName] = useState("")
  const [type, setType] = useState("CASH")
  const [balance, setBalance] = useState("")
  const [icon, setIcon] = useState("cash")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error("Nhập tên tài khoản"); return }
    const bal = parseFloat(balance) || 0
    if (bal < 0) { toast.error("Số dư không thể âm"); return }

    setLoading(true)
    try {
      const res = await fetch("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), type, balance: bal, icon }),
      })
      if (!res.ok) throw new Error()
      toast.success("Tạo tài khoản thành công!")
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px 24px" }}>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: 20, fontWeight: 700,
            letterSpacing: "-0.01em",
          }}>
            Tạo tài khoản mới
          </h2>
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

          {/* Name */}
          <div>
            <label className="label">Tên tài khoản</label>
            <input
              className="input"
              placeholder="Ví tiền, Tài khoản ngân hàng..."
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Type */}
          <div>
            <label className="label">Loại ví</label>
            <select
              className="input"
              value={type}
              onChange={e => setType(e.target.value)}
              style={{ cursor: "pointer" }}
            >
              {walletTypes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Initial Balance */}
          <div>
            <label className="label">Số dư ban đầu</label>
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
                value={balance}
                onChange={e => setBalance(e.target.value)}
                style={{
                  paddingLeft: 36,
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                  letterSpacing: "-0.02em",
                  height: 56,
                }}
              />
            </div>
          </div>

          {/* Icon selector */}
          <div>
            <label className="label">Biểu tượng</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {walletIcons.map(i => (
                <button
                  key={i.value}
                  onClick={() => setIcon(i.value)}
                  style={{
                    aspect: "1",
                    borderRadius: 12,
                    border: icon === i.value ? "2px solid var(--accent)" : "1px solid var(--border)",
                    background: icon === i.value ? "var(--accent-dim)" : "var(--bg-elevated)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 28,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {i.label}
                </button>
              ))}
            </div>
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
                ? <><Loader2 size={15} style={{ animation: "spin-slow 0.8s linear infinite" }} />Đang tạo...</>
                : "Tạo tài khoản"
              }
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
