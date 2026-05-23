"use client"

import { useEffect } from "react"
import Image from "next/image"
import { X, Download } from "lucide-react"

interface Props {
  url: string
  onClose: () => void
}

export default function ImageViewer({ url, onClose }: Props) {
  // Đóng bằng ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  const handleDownload = () => {
    const a = document.createElement("a")
    a.href = url
    a.download = "hoa-don.jpg"
    a.target = "_blank"
    a.click()
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.92)",
        backdropFilter: "blur(8px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn 0.15s ease",
      }}
    >
      {/* Top bar */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0,
        height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 16px",
        background: "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)",
        zIndex: 101,
      }}>
        <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>Ảnh hoá đơn</span>
        <div style={{ display: "flex", gap: 8 }}>
          {/* Download */}
          <button
            onClick={(e) => { e.stopPropagation(); handleDownload() }}
            style={{
              width: 36, height: 36,
              borderRadius: 10,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#fff",
            }}
          >
            <Download size={16} />
          </button>
          {/* Close */}
          <button
            onClick={onClose}
            style={{
              width: 36, height: 36,
              borderRadius: 10,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#fff",
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Image */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "92vw",
          maxHeight: "84vh",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          animation: "scaleIn 0.2s cubic-bezier(0.32,0.72,0,1)",
        }}
      >
        <Image
          src={url}
          alt="Ảnh hoá đơn"
          width={800}
          height={1000}
          style={{
            width: "auto",
            height: "auto",
            maxWidth: "92vw",
            maxHeight: "84vh",
            objectFit: "contain",
            display: "block",
          }}
          unoptimized
        />
      </div>

      {/* Tap outside hint */}
      <p style={{
        position: "fixed", bottom: 24,
        left: "50%", transform: "translateX(-50%)",
        fontSize: 12, color: "rgba(255,255,255,0.35)",
        whiteSpace: "nowrap",
      }}>
        Nhấn ra ngoài hoặc ESC để đóng
      </p>

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  )
}