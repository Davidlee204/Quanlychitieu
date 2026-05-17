"use client"

import { useState, useRef } from "react"
import { X, Camera, Loader2, Receipt } from "lucide-react"
import { toast } from "sonner"
import { uploadImage } from "@/lib/supabase"
import { useSession } from "next-auth/react"
import type { Wallet } from "@prisma/client"
import Image from "next/image"

interface Props {
  wallets: Wallet[]
  onClose: () => void
  onSuccess: () => void
}

export default function ExpenseModal({ wallets, onClose, onSuccess }: Props) {
  const { data: session } = useSession()
  const [note, setNote] = useState("")
  const [amount, setAmount] = useState("")
  const [walletId, setWalletId] = useState(wallets[0]?.id || "")
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const selectedWallet = wallets.find(w => w.id === walletId)

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    const amt = parseFloat(amount)
    if (!amount || isNaN(amt) || amt <= 0) { toast.error("Nhập số tiền hợp lệ"); return }
    if (!walletId) { toast.error("Chọn tài khoản"); return }
    if (selectedWallet && Number(selectedWallet.balance) < amt) { toast.error("Số dư không đủ"); return }

    setLoading(true)
    try {
      let imageUrl: string | undefined
      if (image && session?.user?.id) imageUrl = await uploadImage(image, session.user.id)

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "EXPENSE", amount: amt, note, fromWalletId: walletId, imageUrl }),
      })
      if (!res.ok) throw new Error()
      toast.success("Đã lưu chi tiêu!")
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
          <div>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: 20, fontWeight: 700,
              letterSpacing: "-0.01em",
            }}>
              Thêm chi tiêu
            </h2>
            {selectedWallet && (
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                Từ: {selectedWallet.name} — còn {Number(selectedWallet.balance).toLocaleString("vi-VN")}đ
              </p>
            )}
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

          {/* Amount — big input */}
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
            <label className="label">Nội dung</label>
            <input
              className="input"
              placeholder="Ăn trưa, xăng xe, mua sắm..."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          {/* Wallet select */}
          <div>
            <label className="label">Tài khoản</label>
            <select
              className="input"
              value={walletId}
              onChange={e => setWalletId(e.target.value)}
              style={{ cursor: "pointer" }}
            >
              {wallets.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} — {Number(w.balance).toLocaleString("vi-VN")}đ
                </option>
              ))}
            </select>
          </div>

          {/* Image upload */}
          <div>
            <label className="label">Ảnh hoá đơn (tuỳ chọn)</label>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleImage} />

            {preview ? (
              <div style={{ position: "relative", borderRadius: 14, overflow: "hidden" }}>
                <Image
                  src={preview} alt="receipt"
                  width={400} height={200}
                  style={{ width: "100%", height: 160, objectFit: "cover" }}
                />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)",
                }} />
                <button
                  onClick={() => { setImage(null); setPreview(null) }}
                  style={{
                    position: "absolute", top: 10, right: 10,
                    background: "rgba(0,0,0,0.7)",
                    border: "none", borderRadius: "50%",
                    width: 30, height: 30,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "#fff",
                  }}
                >
                  <X size={14} />
                </button>
                <div style={{ position: "absolute", bottom: 10, left: 14 }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: 5 }}>
                    <Receipt size={12} /> Ảnh hoá đơn
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  width: "100%", height: 88,
                  borderRadius: 14,
                  border: "2px dashed var(--border-bright)",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 8,
                  color: "var(--text-muted)",
                  transition: "all 0.15s",
                  fontFamily: "var(--font-body)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "var(--border-accent)"
                  e.currentTarget.style.color = "var(--accent)"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--border-bright)"
                  e.currentTarget.style.color = "var(--text-muted)"
                }}
              >
                <Camera size={20} />
                <span style={{ fontSize: 13 }}>Chụp hoặc chọn ảnh</span>
              </button>
            )}
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
                ? <><Loader2 size={15} style={{ animation: "spin-slow 0.8s linear infinite" }} />Đang lưu...</>
                : "Lưu chi tiêu"
              }
            </button>
          </div>
        </div>
      </div>
    </>
  )
}