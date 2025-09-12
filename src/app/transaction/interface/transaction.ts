import Decimal from "decimal.js";
import { Account } from "@app/account/interface/account.interface";
import { Goal } from "@app/goal/interface/goal.interface";
import { Page, Pagination } from "@app/shared/interfaces/pagination.interface";

export interface Transaction {
    id: number;
    userId: number;
    account: Account;
    type: string;
    amount: number;
    fee: number;
    date: string;
    description: string;
    category: string;
    goal: Goal;
    transferAccount: Account;
    exchangeRate: number;
}

export interface TransactionResponse {
    page: Page;
    content: Transaction[];
}

export interface TransactionChartOptions {
    transactions: Transaction[];
    splitBy: 'account' | 'currency' | 'category' | 'goal' | 'defaultCurrency';
    limitSeries: 1 | 2 | 3 | 4 | 5;
    convertToDefaultCurrency: boolean;
}

export interface TransactionFilter {
    pagination: Pagination;
    accountId?: number;
    goalId?: number;
    transferAccountId?: number;
    category?: string;
    type?: 'DEPOSIT' | 'WITHDRAW' | 'DEPOSIT_GOAL' | 'WITHDRAW_GOAL';
    userId?: number;
    startDate?: Date;
    endDate?: Date;
    onlyAccountTransactions?: boolean;
    onlyGoalTransactions?: boolean;
}

