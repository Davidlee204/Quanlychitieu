"use client"

import { useState, useRef } from "react"
import { X, Camera, Loader2 } from "lucide-react"
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

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!amount || !walletId) {
      toast.error("Vui lòng nhập đủ thông tin")
      return
    }
    const amt = parseFloat(amount.replace(/\D/g, ""))
    if (isNaN(amt) || amt <= 0) {
      toast.error("Số tiền không hợp lệ")
      return
    }
    const wallet = wallets.find((w) => w.id === walletId)
    if (wallet && Number(wallet.balance) < amt) {
      toast.error("Số dư không đủ")
      return
    }

    setLoading(true)
    try {
      let imageUrl: string | undefined
      if (image && session?.user?.id) {
        imageUrl = await uploadImage(image, session.user.id)
      }

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "EXPENSE", amount: amt, note, fromWalletId: walletId, imageUrl }),
      })

      if (!res.ok) throw new Error()
      toast.success("Đã lưu chi tiêu!")
      onSuccess()
    } catch {
      toast.error("Có lỗi xảy ra, thử lại nhé")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="bottom-sheet-overlay" onClick={onClose} />
      <div className="bottom-sheet">
        {/* Handle bar */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--border)" }} />
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px 20px" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Thêm chi tiêu</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: "0 20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
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
              Nội dung
            </label>
            <input
              className="input-field"
              placeholder="Ăn trưa, xăng xe, mua sắm..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Wallet */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>
              Tài khoản
            </label>
            <select
              className="input-field"
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} — {Number(w.balance).toLocaleString("vi-VN")}đ
                </option>
              ))}
            </select>
          </div>

          {/* Image upload */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.4 }}>
              Ảnh hoá đơn (tuỳ chọn)
            </label>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleImage} />

            {preview ? (
              <div style={{ position: "relative" }}>
                <Image src={preview} alt="receipt" width={400} height={200} style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 12 }} />
                <button
                  onClick={() => { setImage(null); setPreview(null) }}
                  style={{
                    position: "absolute", top: 8, right: 8,
                    background: "rgba(0,0,0,0.6)", border: "none",
                    borderRadius: "50%", width: 28, height: 28,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "#fff",
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                style={{
                  width: "100%", height: 80, borderRadius: 12,
                  border: "2px dashed var(--border)",
                  background: "transparent", cursor: "pointer",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 6,
                  color: "var(--text-muted)",
                }}
              >
                <Camera size={20} />
                <span style={{ fontSize: 13 }}>Chụp hoặc chọn ảnh</span>
              </button>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button className="btn-ghost" onClick={onClose}>Huỷ</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {loading ? <><Loader2 size={16} className="animate-spin" />Đang lưu...</> : "Lưu chi tiêu"}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}