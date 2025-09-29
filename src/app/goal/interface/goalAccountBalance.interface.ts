import Decimal from "decimal.js";
import { Account } from "@app/account/interface/account.interface";

export interface GoalAccountBalance {
    id: number;
    goalId: number;
    account: Account;
    balance: number;
    createdAt: Date;
    lastUpdate: Date;
}