import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Lấy user đầu tiên (đã đăng nhập bằng Google)
  const user = await prisma.user.findFirst()
  if (!user) {
    console.log("❌ Chưa có user. Hãy đăng nhập Google trước rồi chạy seed!")
    return
  }

  console.log(`✅ Seed cho user: ${user.email}`)

  // Tạo wallets
  const cash = await prisma.wallet.upsert({
    where: { id: "seed-cash" },
    update: {},
    create: { id: "seed-cash", name: "Tiền mặt", balance: 2500000, type: "CASH", color: "#10b981", icon: "cash", userId: user.id },
  })

  const bank = await prisma.wallet.upsert({
    where: { id: "seed-bank" },
    update: {},
    create: { id: "seed-bank", name: "Vietcombank", balance: 12000000, type: "BANK", color: "#6366f1", icon: "bank", userId: user.id },
  })

  const momo = await prisma.wallet.upsert({
    where: { id: "seed-momo" },
    update: {},
    create: { id: "seed-momo", name: "MoMo", balance: 800000, type: "EWALLET", color: "#ec4899", icon: "ewallet", userId: user.id },
  })

  // Tạo transactions mẫu
  const now = new Date()
  const yesterday = new Date(now.getTime() - 86400000)

  await prisma.transaction.createMany({
    data: [
      { type: "EXPENSE", amount: 45000, note: "Ăn trưa bún bò", fromWalletId: cash.id, userId: user.id, createdAt: now },
      { type: "EXPENSE", amount: 25000, note: "Xăng xe", fromWalletId: cash.id, userId: user.id, createdAt: new Date(now.getTime() - 3600000) },
      { type: "EXPENSE", amount: 120000, note: "Siêu thị", fromWalletId: bank.id, userId: user.id, createdAt: yesterday },
      { type: "TRANSFER", amount: 500000, note: "Nạp MoMo", fromWalletId: bank.id, toWalletId: momo.id, userId: user.id, createdAt: yesterday },
    ],
    skipDuplicates: true,
  })

  console.log("🎉 Seed hoàn tất!")
  console.log(`   - Tiền mặt: 2,500,000đ`)
  console.log(`   - Vietcombank: 12,000,000đ`)
  console.log(`   - MoMo: 800,000đ`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())