import { IconPencil } from "@tabler/icons-react";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import Divider from "@/components/Divider";

export type AmountLine = {
    label: string;
    amount?: number;
    showPlus?: boolean;
    decimals?: number;
    date?: string;
};

type AccountCardBase<TType extends "checking" | "savings" | "loan"> = {
    type: TType;
    title: string;
};

type OwnedAccountCardBase<TType extends "checking" | "savings"> = AccountCardBase<TType> & {
    owner: string;
    balance: number;
};

export type CheckingAccountCardProps = OwnedAccountCardBase<"checking"> & {
    credits: AmountLine[];
    operations: AmountLine[];
};

export type SavingsAccountCardProps = OwnedAccountCardBase<"savings"> & {
    rate: string;
    movements: AmountLine[];
};

export type LoanCardProps = AccountCardBase<"loan"> & {
    amount: number;
    nextPayment?: AmountLine;
    informations?: { term: string; endDate: string };
    monthly?: number;
    status?: string;
};

export type AccountCardProps = CheckingAccountCardProps | SavingsAccountCardProps | LoanCardProps;

const formatNumber = (value: number, decimals: number) =>
    value.toLocaleString("fr-FR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const formatAmount = (
    value: number,
    { showPlus = false, decimals }: { showPlus?: boolean; decimals?: number } = {},
) => {
    const resolvedDecimals = typeof decimals === "number" ? decimals : Number.isInteger(value) ? 0 : 2;
    const prefix = value < 0 ? "- " : showPlus && value >= 0 ? "+ " : "";
    return `${prefix}${formatNumber(Math.abs(value), resolvedDecimals)}€`;
};

const formatDate = (value: string) => {
    const separator = value.includes("-") ? "-" : value.includes("/") ? "/" : null;
    if (!separator) return value;

    const parts = value.split(separator);
    if (parts.length !== 3) return value;

    const [year, month, day] =
        separator === "-" ? parts.map(Number) : [Number(parts[2]), Number(parts[1]), Number(parts[0])];

    if ([year, month, day].some(Number.isNaN)) return value;

    const monthNames = ["jan.", "feb.", "mar.", "apr.", "may", "jun.", "jul.", "aug.", "sep.", "oct.", "nov.", "dec."];
    const monthLabel = monthNames[month - 1];
    if (!monthLabel) return value;

    return `${day} ${monthLabel} ${year}`;
};

const AmountRow = ({ label, amount, showPlus, decimals, date }: AmountLine) => (
    <div className="flex items-baseline justify-between gap-3 text-sm sm:text-base">
        <span className="text-white">{date ? `${label} : ${formatDate(date)}` : label}</span>
        {typeof amount === "number" && (
            <span className="text-right font-semibold text-white">{formatAmount(amount, { showPlus, decimals })}</span>
        )}
    </div>
);

const EditableOwner = ({ owner, ariaLabel }: { owner: string; ariaLabel: string }) => (
    <span className="flex items-center gap-3 text-sm font-semibold text-white sm:justify-end sm:self-start">
        <span className="whitespace-nowrap">{owner}</span>
        <span className="text-white" aria-hidden>
            |
        </span>
        <Button
            type="button"
            unstyled
            aria-label={`Edit account`}
        >
            <IconPencil stroke={2.5} size={18}/>
        </Button>
    </span>
);

const AccountCard = (props: AccountCardProps) => {
    const titleAlignment = props.type === "checking" ? "sm:items-center" : "sm:items-start";

    const renderHeader = () => {
        if (props.type === "checking") {
            const { title, owner } = props;
            return (
                <>
                    <span>{title}</span>
                    <EditableOwner owner={owner} ariaLabel="Modifier le compte" />
                </>
            );
        }

        if (props.type === "savings") {
            const { title, rate, owner } = props;
            return (
                <>
                    <span className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                        <span>{title}</span>
                        <span>| {rate}</span>
                    </span>
                    <EditableOwner owner={owner} ariaLabel="Modifier l'épargne" />
                </>
            );
        }

        const { title, amount } = props;
        return (
            <>
                <span>{title}</span>
                <span className="text-lg font-semibold sm:self-start sm:text-right">
                    {formatAmount(amount, { decimals: 0 })}
                </span>
            </>
        );
    };

    const renderContent = () => {
        if (props.type === "checking") {
            const { credits, operations } = props;

            const hasCredits = credits.length > 0;
            const hasOperations = operations.length > 0;
            if (!hasCredits && !hasOperations) {
                return null;
            }

            return (
                <div className="space-y-5">
                    {hasCredits && (
                        <div className="space-y-1">
                            <p className="font-bold">Loans</p>
                            <div>
                                {credits.map((credit) => (
                                    <AmountRow key={credit.label} {...credit} />
                                ))}
                            </div>
                        </div>
                    )}

                    {hasOperations && (
                        <div className="space-y-1">
                            <p className="font-bold">Transactions</p>
                            <div>
                                {operations.map((operation) => (
                                    <AmountRow key={operation.label} {...operation} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        if (props.type === "savings") {
            const { title, movements } = props;
            return (
                <div className="space-y-1">
                    {movements.map((movement) => (
                        <AmountRow key={`${title}-${movement.label}-${movement.amount}`} {...movement} />
                    ))}
                </div>
            );
        }

        const { nextPayment, informations } = props;
        if (!nextPayment && !informations) {
            return null;
        }

        return (
            <div className="space-y-5">
                {nextPayment && (
                    <div className="space-y-1">
                        <p className="font-bold">Operations</p>
                        <div>
                            <AmountRow {...nextPayment} />
                        </div>
                    </div>
                )}

                {informations && (
                    <div className="space-y-1">
                        <p className="font-bold">Informations</p>
                        <div>
                            <p>Term : {informations.term}</p>
                            <p>End date : {formatDate(informations.endDate)}</p>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderFooter = () => {
        if (props.type === "checking" || props.type === "savings") {
            return (
                <h2 className="text-right text-lg font-semibold">
                    {formatAmount(props.balance)}
                </h2>
            );
        }

        const { status, monthly, nextPayment } = props;
        const value =
            status ??
            (typeof monthly === "number"
                ? `${formatAmount(monthly, { decimals: 0 })} / Month`
                : formatAmount(nextPayment?.amount ?? 0, { decimals: 0 }));

        return (
            <p className="text-right text-lg font-semibold">
                {value}
            </p>
        );
    };

    return (
        <Card asLink>
            <CardHeader className="gap-2">
                <CardTitle className={`flex flex-col gap-2 sm:flex-row sm:justify-between sm:gap-4 ${titleAlignment}`}>
                    {renderHeader()}
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {renderContent()}

                <div className="space-y-4">
                    <Divider />
                    {renderFooter()}
                </div>
            </CardContent>
        </Card>
    );
};

export default AccountCard;
