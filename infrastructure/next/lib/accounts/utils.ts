import {
  Account,
  AccountStatusValue,
  AccountTypeValue,
} from "@/types/accounts";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export function formatAmount(amount: number, decimals: number = 2): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatAmountCompact(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    notation: "compact",
    compactDisplay: "short",
  }).format(amount);
}

export function formatIBAN(iban: string): string {
  const cleaned = iban.replace(/\s/g, "");
  return cleaned.match(/.{1,4}/g)?.join(" ") || iban;
}

export function validateIBAN(iban: string): boolean {
  const cleaned = iban.replace(/\s/g, "").toUpperCase();

  if (!/^FR\d{25}$/.test(cleaned)) {
    return false;
  }

  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (char) =>
    (char.charCodeAt(0) - 55).toString()
  );

  let remainder = "";
  for (let i = 0; i < numeric.length; i++) {
    remainder += numeric[i];
    if (remainder.length >= 9) {
      remainder = (parseInt(remainder) % 97).toString();
    }
  }

  return parseInt(remainder) % 97 === 1;
}

export function formatDate(
  date: string | Date,
  formatStr: string = "dd/MM/yyyy"
): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: fr });
}

export function formatDateRelative(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffInDays === 0) return "Aujourd'hui";
  if (diffInDays === 1) return "Hier";
  if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
  if (diffInDays < 30) return `Il y a ${Math.floor(diffInDays / 7)} semaines`;
  if (diffInDays < 365) return `Il y a ${Math.floor(diffInDays / 30)} mois`;
  return `Il y a ${Math.floor(diffInDays / 365)} ans`;
}

export function translateAccountType(type: AccountTypeValue): string {
  const translations: Record<AccountTypeValue, string> = {
    current: "Compte courant",
    savings: "Compte épargne",
    trading: "Compte titres",
  };
  return translations[type] || type;
}

export function translateAccountStatus(status: AccountStatusValue): string {
  const translations: Record<AccountStatusValue, string> = {
    open: "Actif",
    close: "Fermé",
  };
  return translations[status] || status;
}

export function getAccountTypeBadgeColor(type: AccountTypeValue): string {
  const colors: Record<AccountTypeValue, string> = {
    current: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    savings:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    trading:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  };
  return colors[type] || "bg-gray-100 text-gray-800";
}

export function getAccountStatusBadgeColor(status: AccountStatusValue): string {
  const colors: Record<AccountStatusValue, string> = {
    open: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    close: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function calculateAvailableBalance(account: Account): number {
  if (!account.authorizedOverdraft || !account.overdraftLimit) {
    return account.balance;
  }
  return account.balance + account.overdraftLimit;
}

export function isOverdrawn(account: Account): boolean {
  return account.balance < 0;
}

export function isOverdraftExceeded(account: Account): boolean {
  if (!account.authorizedOverdraft || !account.overdraftLimit) {
    return account.balance < 0;
  }
  return account.balance < -account.overdraftLimit;
}

export function filterAccountsByType(
  accounts: Account[],
  types: AccountTypeValue[]
): Account[] {
  if (types.length === 0) return accounts;
  return accounts.filter((account) => types.includes(account.accountType));
}

export function filterAccountsByStatus(
  accounts: Account[],
  statuses: AccountStatusValue[]
): Account[] {
  if (statuses.length === 0) return accounts;
  return accounts.filter(
    (account) => account.status && statuses.includes(account.status)
  );
}

export function sortAccountsByBalance(
  accounts: Account[],
  order: "asc" | "desc" = "desc"
): Account[] {
  return [...accounts].sort((a, b) => {
    return order === "asc" ? a.balance - b.balance : b.balance - a.balance;
  });
}

export function sortAccountsByName(
  accounts: Account[],
  order: "asc" | "desc" = "asc"
): Account[] {
  return [...accounts].sort((a, b) => {
    const comparison = a.accountName.localeCompare(b.accountName);
    return order === "asc" ? comparison : -comparison;
  });
}

export function searchAccounts(accounts: Account[], query: string): Account[] {
  if (!query.trim()) return accounts;

  const lowerQuery = query.toLowerCase();
  return accounts.filter((account) => {
    const nameMatch = account.accountName.toLowerCase().includes(lowerQuery);
    const ibanMatch = account.IBAN?.toLowerCase().includes(lowerQuery);
    return nameMatch || ibanMatch;
  });
}

export function calculateTotalBalance(accounts: Account[]): number {
  return accounts.reduce((total, account) => total + account.balance, 0);
}

export function groupAccountsByType(
  accounts: Account[]
): Record<AccountTypeValue, Account[]> {
  return accounts.reduce((groups, account) => {
    const type = account.accountType;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(account);
    return groups;
  }, {} as Record<AccountTypeValue, Account[]>);
}

export function maskIBAN(iban: string): string {
  if (iban.length < 8) return iban;

  const cleaned = iban.replace(/\s/g, "");
  const visible = 4;
  const masked = cleaned.slice(visible, -visible).replace(/./g, "*");
  const result = cleaned.slice(0, visible) + masked + cleaned.slice(-visible);

  return formatIBAN(result);
}

export function getAccountDescription(account: Account): string {
  const type = translateAccountType(account.accountType);
  const balance = formatAmount(account.balance);
  return `${type} • ${balance}`;
}

export function canCloseAccount(account: Account): boolean {
  return account.balance === 0 && account.status === "open";
}

export function getCloseAccountError(account: Account): string | null {
  if (account.status === "close") {
    return "Ce compte est déjà fermé";
  }
  if (account.balance !== 0) {
    return `Le solde doit être à 0€ pour clôturer le compte (actuellement ${formatAmount(
      account.balance
    )})`;
  }
  return null;
}
