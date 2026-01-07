import { Credit } from "@domain/entities/credit";
import { DueDate } from "@domain/entities/dueDate";

export type CreditWithDueDates = {
  credit: Credit;
  dueDates: DueDate[];
};
