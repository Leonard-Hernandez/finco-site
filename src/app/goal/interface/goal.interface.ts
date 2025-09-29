import { GoalAccountBalance } from "@app/goal/interface/goalAccountBalance.interface";
import { Account } from "@app/account/interface/account.interface";
import { Page, Pagination } from "@app/shared/interfaces/pagination.interface";

export interface Goal {
    id?: number;
    name: string;
    targetAmount: number;
    deadLine: Date;
    description?: string;
    creationDate?: Date;
    isEnable?: boolean;
    goalAccountBalances?: GoalAccountBalance[];
}

export interface GoalResponse {
    content: Goal[];
    page: Page;
}

export interface GoalFilter {
    pagination: Pagination;
    accountId?: number;
    userId?: number;
}

export interface GoalTransactionData {
    account: Account,
    amount: number,
    description?: string,
    category?: string
  }