import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const txn = await prisma.transaction.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!txn) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.$transaction(async (tx) => {
    // Hoàn lại số dư
    await tx.wallet.update({
      where: { id: txn.fromWalletId },
      data: { balance: { increment: Number(txn.amount) } },
    })
    if (txn.type === "TRANSFER" && txn.toWalletId) {
      await tx.wallet.update({
        where: { id: txn.toWalletId },
        data: { balance: { decrement: Number(txn.amount) } },
      })
    }
    await tx.transaction.delete({ where: { id } })
  })

  return NextResponse.json({ success: true })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { note, imageUrl } = body

  const txn = await prisma.transaction.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!txn) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const updated = await prisma.transaction.update({
    where: { id },
    data: { note, imageUrl },
    include: { fromWallet: true, toWallet: true },
  })
  return NextResponse.json(updated)
}