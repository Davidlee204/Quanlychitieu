import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const walletId = params.id
  const wallet = await prisma.wallet.findUnique({ where: { id: walletId } })
  if (!wallet || wallet.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const body = await req.json()
  const { name, balance, type, icon } = body

  const updated = await prisma.wallet.update({
    where: { id: walletId },
    data: {
      ...(name !== undefined && { name }),
      ...(balance !== undefined && { balance: parseFloat(balance) }),
      ...(type !== undefined && { type }),
      ...(icon !== undefined && { icon }),
    },
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const walletId = params.id
  const wallet = await prisma.wallet.findUnique({ where: { id: walletId } })
  if (!wallet || wallet.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.wallet.delete({ where: { id: walletId } })
  return NextResponse.json({ success: true })
}
