import { BankConfiguration } from "@application/services/BankConfiguration";

export class EnvironmentBankConfiguration implements BankConfiguration {
  private readonly bankAccountIBAN: string;

  constructor() {
    this.bankAccountIBAN = process.env.BANK_ACCOUNT_IBAN || "FR7630001007941234567890185";
  }

  getBankAccountIBAN(): string {
    return this.bankAccountIBAN;
  }
}
