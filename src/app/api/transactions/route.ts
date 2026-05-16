import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get("limit") || "50")

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    include: { fromWallet: true, toWallet: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  })
  return NextResponse.json(transactions)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { type, amount, note, imageUrl, fromWalletId, toWalletId } = body

  const amt = parseFloat(amount)
  if (!amt || amt <= 0) return NextResponse.json({ error: "Số tiền không hợp lệ" }, { status: 400 })

  // Chạy trong transaction để đảm bảo dữ liệu nhất quán
  const result = await prisma.$transaction(async (tx) => {
    // Trừ tiền tài khoản nguồn
    await tx.wallet.update({
      where: { id: fromWalletId },
      data: { balance: { decrement: amt } },
    })

    // Nếu là Transfer → cộng tiền tài khoản đích
    if (type === "TRANSFER" && toWalletId) {
      await tx.wallet.update({
        where: { id: toWalletId },
        data: { balance: { increment: amt } },
      })
    }

    return tx.transaction.create({
      data: {
        type,
        amount: amt,
        note,
        imageUrl,
        fromWalletId,
        toWalletId: type === "TRANSFER" ? toWalletId : null,
        userId: session.user.id,
      },
      include: { fromWallet: true, toWallet: true },
    })
  })

  return NextResponse.json(result, { status: 201 })
}