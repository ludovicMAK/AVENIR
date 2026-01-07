import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import EditableTitle from "@/components/EditableTitle";
import Divider from "@/components/Divider";
import { formatAmount, formatDate } from "@/lib/formatters"

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

export type AccountCardProps = (CheckingAccountCardProps | SavingsAccountCardProps | LoanCardProps) & {
    href?: string;
};

const AmountRow = ({ label, amount, showPlus, decimals, date }: AmountLine) => (
    <div className="flex items-baseline justify-between gap-3 text-sm sm:text-base">
        <span className="text-white">{date ? `${label} : ${formatDate(date)}` : label}</span>
        {typeof amount === "number" && (
            <span className="text-right font-semibold text-white">{formatAmount(amount, { showPlus, decimals })}</span>
        )}
    </div>
);

const AccountCard = ({ href, ...props }: AccountCardProps) => {
    const titleAlignment = props.type === "checking" ? "sm:items-center" : "sm:items-start";
    const linkHref = typeof href === "string" && href.length > 0 ? href : null;

    const renderHeader = () => {
        if (props.type === "checking") {
            const { title } = props;
            return (
                <EditableTitle
                    title={title}
                    ariaLabel="Edit account"
                    className="w-full"
                />
            );
        }

        if (props.type === "savings") {
            const { title, rate } = props;
            return (
                <EditableTitle
                    title={`${title} | ${rate}`}
                    ariaLabel="Edit savings account"
                    className="w-full"
                />
            );
        }

        const { title, amount } = props;
        return (
            <div className="w-full flex items-center justify-between">
                <span className="truncate">{title}</span>
                <span className="text-lg font-semibold">{formatAmount(amount, { decimals: 0 })}</span>
            </div>
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
        <Card asLink={Boolean(linkHref)} linkProps={linkHref ? { href: linkHref } : undefined}>
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
