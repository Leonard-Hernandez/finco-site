import Decimal from "decimal.js";
import { Account } from "../../account/interface/account.interface";
import { Goal } from "../../goal/interface/goal.interface";
import { Page, Pagination } from "../../shared/interfaces/pagination.interface";

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
    trasnferAccount: Account;
    exchamgeRate: number;
}

export interface TransactionResponse {
    page: Page;
    content: Transaction[];
}

export interface TransactionFilter {
    pagination: Pagination;
    accountId?: number;
    goalId?: number;
    transferAccountId?: number;
    category?: string;
    type?: 'DEPOSIT' | 'WITHDRAW' | 'DEPOSIT_GOAL' | 'WITHDRAW_GOAL';
    userId?: number;
}

