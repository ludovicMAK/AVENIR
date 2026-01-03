import AccountCard, {
    AccountCardProps,
    LoanCardProps,
} from "@/components/AccountCard";
import { Button } from "@/components/Button";
import Header from "@/components/Header";
import { Account } from "@/types/accounts";
import { UserSummary } from "@/types/users";
import Divider from "@/components/Divider";
import { IconPlus } from "@tabler/icons-react";
import type { PropsWithChildren } from "react";
import { getCurrentUser } from "@/lib/users/server";
import { accountsApi } from "@/api/account";

type BaseCardProps<T extends AccountCardProps> = Omit<T, "type">;

type AccountCardItem = {
    id: string;
    card: AccountCardProps;
};

type SectionProps = PropsWithChildren<{
    title: string;
    className?: string;
    onAddClick?: () => void;
}>;

const Section = ({ title, children, className, onAddClick }: SectionProps) => (
    <section className={className ? `space-y-3 ${className}` : "space-y-3"}>
        <div className="flex items-center justify-between">
            <h1>{title}</h1>
            <Button
                type="button"
                unstyled
                aria-label={`Add ${title}`}
                onClick={onAddClick}
            >
                <IconPlus stroke={2.5} />
            </Button>
        </div>
        {children}
    </section>
);

const loans: BaseCardProps<LoanCardProps>[] = [
    {
        title: "Mortgage",
        amount: 340000,
        nextPayment: { label: "Next monthly payment", date: "2026-01-01", amount: -500, decimals: 0 },
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
        status: "Monthly repayment based on the used amount"
    },
];

const mapAccountToCard = (account: Account, ownerName?: string): AccountCardItem | null => {
    const owner = ownerName ?? account.idOwner;

    if (account.accountType === "current") {
        return {
            id: account.id,
            card: {
                type: "checking",
                title: account.accountName,
                owner,
                credits: [],
                operations: [],
                balance: account.balance,
            },
        };
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
            },
        };
    }

    return null;
};

async function getAccountCardsForCurrentUser(): Promise<{
    currentUser: UserSummary | null;
    checking: AccountCardItem[];
    savings: AccountCardItem[];
}> {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return { currentUser: null, checking: [], savings: [] };
    }

    try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
            return { currentUser: null, checking: [], savings: [] }
        }

        const accounts = await accountsApi.getAccountsByUserId(currentUser.id)
        const ownerName = `${currentUser.firstname} ${currentUser.lastname}`;

        const checking: AccountCardItem[] = [];
        const savings: AccountCardItem[] = [];

        accounts.forEach((account: Account) => {
            const mapped = mapAccountToCard(account, ownerName);
            if (!mapped) return;

            if (mapped.card.type === "checking") {
                checking.push(mapped);
            } else if (mapped.card.type === "savings") {
                savings.push(mapped);
            }
        });

        return { currentUser, checking, savings };
    } catch (error) {
        console.error("Unable to load accounts", error);
        return { currentUser, checking: [], savings: [] };
    }
}

export default async function Home() {
    const { currentUser, checking, savings } = await getAccountCardsForCurrentUser();

    return (
        <>
            <Header initialUser={currentUser} />
            <main className="bg-background text-white pt-28 pb-14">
                <div className="layout">
                    <div className="flex flex-col gap-16 xl:gap-8 xl:flex-row xl:items-start">
                        <div className="flex-1 space-y-8">
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

                        <Divider className="xl:hidden" aria-hidden />

                        <Section title="Loans" className="w-full xl:w-[32rem]">
                            <div className="space-y-4 opacity-50">
                                {loans.map((loan) => (
                                    <AccountCard key={loan.title} type="loan" {...loan} />
                                ))}
                            </div>
                        </Section>
                    </div>
                </div>
            </main>
        </>
    );
}
