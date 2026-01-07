import AccountCard, {
    AccountCardProps,
    LoanCardProps,
    AmountLine,
} from "@/components/AccountCard"
import PageLayout from "@/components/PageLayout"
import { Button } from "@/components/Button"
import { Account } from "@/types/accounts"
import { UserSummary } from "@/types/users"
import { IconPlus } from "@tabler/icons-react"
import type { PropsWithChildren } from "react"
import { getCurrentUser } from "@/lib/users/server"
import { accountsApi } from "@/api/account"
import { transactionsApi } from "@/api/transactions"
import { TransactionHistoryItem } from "@/types/transactions"
import { cookies } from "next/headers"
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants"

type BaseCardProps<T extends AccountCardProps> = Omit<T, "type">

type AccountCardItem = {
    id: string
    card: AccountCardProps
}

type SectionProps = PropsWithChildren<{
    title: string
    className?: string
    onAddClick?: () => void
}>

const Section = ({
    title,
    children,
    className,
    onAddClick,
}: SectionProps) => (
    <section className={className ? `space-y-3 ${className}` : "space-y-3"}>
        <div className="flex items-center justify-between">
            <h1>{title}</h1>
            {onAddClick && (
                <Button
                    type="button"
                    unstyled
                    aria-label={`Add ${title}`}
                    onClick={onAddClick}
                >
                    <IconPlus stroke={2.5} />
                </Button>
            )}
        </div>
        {children}
    </section>
)

const toDayKey = (value: string): string | null => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return date.toISOString().slice(0, 10)
}

const buildLatestDayOperations = (transactions: TransactionHistoryItem[]): AmountLine[] => {
    if (transactions.length === 0) return []

    const sorted = [...transactions].sort(
        (first, second) => new Date(second.executedAt).getTime() - new Date(first.executedAt).getTime()
    )

    const latestDayKey = toDayKey(sorted[0].executedAt)
    if (!latestDayKey) return []

    return sorted
        .filter((transaction) => toDayKey(transaction.executedAt) === latestDayKey)
        .map((transaction) => ({
            label: transaction.name,
            amount: transaction.direction === "credit" ? transaction.amount : -transaction.amount,
            showPlus: true,
            date: latestDayKey,
        }))
}

const fetchLatestDayOperations = async ({
    accountId,
    userId,
    authToken,
}: {
    accountId: string
    userId: string
    authToken: string
}) => {
    try {
        const transactions = await transactionsApi.getByAccountId(accountId, { authToken, userId })
        return buildLatestDayOperations(transactions)
    } catch (error) {
        console.error(`Unable to load transactions for account ${accountId}`, error)
        return []
    }
}

const loans: BaseCardProps<LoanCardProps>[] = [
    {
        title: "Mortgage",
        amount: 340000,
        nextPayment: {
            label: "Next monthly payment",
            date: "2026-01-01",
            amount: -500,
            decimals: 0,
        },
        informations: { term: "2years", endDate: "2026-04-01" },
        monthly: 500,
    },
    {
        title: "Car loan",
        amount: 40000,
        status: "Pending",
    },
    {
        title: "Student loan",
        amount: 20000,
        informations: { term: "3years", endDate: "2027-12-01" },
        status: "Monthly repayment based on the used amount",
    },
]

const mapAccountToCard = (
    account: Account,
    ownerName?: string,
    operations: AmountLine[] = []
): AccountCardItem | null => {
    const owner = ownerName ?? account.idOwner

    if (account.accountType === "current") {
        return {
            id: account.id,
            card: {
                type: "checking",
                title: account.accountName,
                owner,
                credits: [],
                operations,
                balance: account.balance,
                href: `/account/${encodeURIComponent(account.id)}`,
            },
        }
    }

    if (account.accountType === "savings") {
        return {
            id: account.id,
            card: {
                type: "savings",
                title: account.accountName,
                rate: "N/A",
                owner,
                movements: [],
                balance: account.balance,
                href: `/account/${encodeURIComponent(account.id)}`,
            },
        }
    }

    return null
}

async function getAccountCardsForCurrentUser(): Promise<{
    currentUser: UserSummary | null
    checking: AccountCardItem[]
    savings: AccountCardItem[]
}> {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
        return { currentUser: null, checking: [], savings: [] }
    }

    const cookieStore = await cookies()
    const authToken = cookieStore.get(AUTH_COOKIE_NAME)?.value

    try {
        const accounts = await accountsApi.getAccountsByUserId(currentUser.id)
        const ownerName = `${currentUser.firstname} ${currentUser.lastname}`
        const operationsByAccountId = new Map<string, AmountLine[]>()

        if (authToken) {
            const operationsResults = await Promise.all(
                accounts
                    .filter((account) => account.accountType === "current")
                    .map(async (account) => ({
                        accountId: account.id,
                        operations: await fetchLatestDayOperations({
                            accountId: account.id,
                            userId: currentUser.id,
                            authToken,
                        }),
                    }))
            )

            operationsResults.forEach(({ accountId, operations }) =>
                operationsByAccountId.set(accountId, operations)
            )
        }

        const checking: AccountCardItem[] = []
        const savings: AccountCardItem[] = []

        accounts.forEach((account: Account) => {
            const operations = operationsByAccountId.get(account.id) ?? []
            const mapped = mapAccountToCard(account, ownerName, operations)
            if (!mapped) return

            if (mapped.card.type === "checking") checking.push(mapped)
            if (mapped.card.type === "savings") savings.push(mapped)
        })

        return { currentUser, checking, savings }
    } catch (error) {
        console.error("Unable to load accounts", error)
        return { currentUser, checking: [], savings: [] }
    }
}

export default async function Home() {
    const { checking, savings } = await getAccountCardsForCurrentUser()

    return (
        <PageLayout
            main={
                <div className="space-y-8">
                    <Section title="Checking account">
                        {checking.length === 0 ? (
                            <p>No checking account available.</p>
                        ) : (
                            checking.map(({ id, card }) => (
                                <AccountCard key={id} {...card} />
                            ))
                        )}
                    </Section>

                    <Section title="Savings account">
                        <div className="flex flex-col gap-4 lg:flex-wrap">
                            {savings.length === 0 ? (
                                <p>No savings account available.</p>
                            ) : (
                                savings.map(({ id, card }) => (
                                    <div key={id} className="flex-1 min-w-[16rem]">
                                        <AccountCard {...card} />
                                    </div>
                                ))
                            )}
                        </div>
                    </Section>
                </div>
            }
            aside={
                <Section title="Loans">
                    <div className="space-y-4 opacity-50">
                        {loans.map((loan) => (
                            <AccountCard key={loan.title} type="loan" {...loan} />
                        ))}
                    </div>
                </Section>
            }
        />
    )
}
