import type { Wallet, Transaction, WalletType } from "@prisma/client"

export type { Wallet, Transaction, WalletType }

export type WalletWithTransactions = Wallet & {
  fromTransactions: Transaction[]
  toTransactions: Transaction[]
}

export type TransactionWithWallets = Transaction & {
  fromWallet: Wallet
  toWallet: Wallet | null
}

// Extend NextAuth session
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}