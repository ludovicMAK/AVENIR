import { DueDate } from "@domain/entities/dueDate";
import { Credit } from "@domain/entities/credit";

export type OverdueDueDateWithCredit = {
  dueDate: DueDate;
  credit: Credit;
  customerName?: string;
};
