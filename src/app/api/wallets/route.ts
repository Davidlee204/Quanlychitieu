import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const wallets = await prisma.wallet.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json(wallets)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { name, balance, type, color, icon } = body

  const wallet = await prisma.wallet.create({
    data: {
      name,
      balance: parseFloat(balance) || 0,
      type: type || "CASH",
      color: color || "#6366f1",
      icon: icon || "wallet",
      userId: session.user.id,
    },
  })
  return NextResponse.json(wallet, { status: 201 })
}