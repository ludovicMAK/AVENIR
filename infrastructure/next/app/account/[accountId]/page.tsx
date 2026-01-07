import { cookies } from "next/headers"

import PageLayout from "@/components/PageLayout"
import { Button } from "@/components/Button"
import EditableTitle from "@/components/EditableTitle"
import BalanceChart from "@/components/BalanceChart"
import TransactionsList from "@/components/TransactionsList"
import { accountsApi } from "@/api/account"
import { transactionsApi } from "@/api/transactions"
import { getCurrentUser } from "@/lib/users/server"
import { formatAmount, formatDate } from "@/lib/formatters"
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants"
import { TransactionHistoryItem } from "@/types/transactions"

type AccountPageProps = {
    params: Promise<{
        accountId: string
    }>
}

type Transaction = {
    label: string
    date: string
    amount: string
}

type TransactionGroup = {
    dayKey: string
    dayLabel: string
    items: Transaction[]
}

type OldTransaction = TransactionHistoryItem & { status: "validated" | "posted"; counterpartyIban: string }

const buildTransactionGroupsFromBalanceHistory = (transactions: OldTransaction[]): TransactionGroup[] => {
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime())

    const groupsByDayKey = new Map<string, { dayKey: string; dayLabel: string; items: Transaction[] }>()

    for (const transactionItem of sortedTransactions) {
        const executedDate = new Date(transactionItem.executedAt)
        const dayKey = executedDate.toISOString().slice(0, 10)

        const signedAmount = transactionItem.direction === "credit" ? transactionItem.amount : -transactionItem.amount
        const item: Transaction = {
            label: transactionItem.name,
            date: formatDate(dayKey),
            amount: formatAmount(signedAmount, { showPlus: true }),
        }

        const existing = groupsByDayKey.get(dayKey)
        if (existing) {
            existing.items.push(item)
            continue
        }

        groupsByDayKey.set(dayKey, {
            dayKey,
            dayLabel: formatDate(dayKey),
            items: [item],
        })
    }

    return Array.from(groupsByDayKey.entries())
        .sort((a, b) => (a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0))
        .map(([, group]) => group)
}

const sanitizeTransaction = (transaction: TransactionHistoryItem): OldTransaction => ({
    ...transaction,
    status: transaction.status === "validated" || transaction.status === "posted" ? transaction.status : "posted",
    counterpartyIban: transaction.counterpartyIban ?? "",
})

export default async function AccountPage({ params }: AccountPageProps) {
    const { accountId } = await params
    const currentUser = await getCurrentUser()
    const cookieStore = await cookies()
    const authToken = cookieStore.get(AUTH_COOKIE_NAME)?.value

    const accountPromise = accountsApi.getAccountById(accountId).catch((error) => {
        console.error("Unable to load account", error)
        return null
    })

    const transactionsPromise = authToken
        ? transactionsApi
              .getByAccountId(accountId, { authToken, userId: currentUser?.id })
              .then((items) => items.map(sanitizeTransaction))
              .catch((error) => {
                  console.error("Unable to load transactions", error)
                  return [] as OldTransaction[]
              })
        : Promise.resolve([] as OldTransaction[])

    const [account, accountTransactions] = await Promise.all([accountPromise, transactionsPromise])

    const accountTitle = account?.accountName ?? ""
    const accountBalance =
        typeof account?.balance === "number" ? formatAmount(account.balance, { showPlus: true }) : ""
    const ownerLabel = currentUser ? `${currentUser.firstname} ${currentUser.lastname}` : account?.idOwner ?? ""
    const accountIban = account?.IBAN ?? ""
    const transactionGroups: TransactionGroup[] = buildTransactionGroupsFromBalanceHistory(accountTransactions)

    return (
        <PageLayout
            main={
                <>
                    <div className="flex flex-col gap-4 flex-shrink-0">
                        <EditableTitle
                            title={accountTitle}
                            ariaLabel="Modifier le compte"
                            showDivider
                            className="w-full"
                            titleClassName="text-2xl font-bold leading-none"
                            rightContent={<span className="text-2xl font-semibold">{accountBalance}</span>}
                        />
                        <div className="w-full flex justify-between items-start md:items-center flex-col md:flex-row gap-2">
                            <div className="flex flex-col text-white">
                                <p>{ownerLabel}</p>
                                <p>{accountIban}</p>
                            </div>
                            <Button type="button" primaryColor={false}>
                                Make a transfer
                            </Button>
                        </div>
                    </div>

                    <TransactionsList transactionGroups={transactionGroups} />
                </>
            }
            aside={
                <>
                    <h2 className="text-2xl font-bold">Statistics</h2>
                    <BalanceChart
                        transactions={accountTransactions}
                    />
                </>
            }
        />
    )
}
