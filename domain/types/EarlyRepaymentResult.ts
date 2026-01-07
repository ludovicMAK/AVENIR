import { Credit } from "@domain/entities/credit";
import { Transfer } from "@domain/entities/transfer";

export type EarlyRepaymentResult = {
  credit: Credit;
  totalAmountPaid: number;
  cancelledDueDates: number;
  transfer: Transfer;
};
