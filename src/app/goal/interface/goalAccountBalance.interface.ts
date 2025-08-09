import Decimal from "decimal.js";
import { Account } from "../../account/interface/account.interface";

export class GoalAccountBalance {
    id!: number;
    goalId!: number;
    account!: Account;
    balance!: Decimal;
    createdAt!: Date;
    lastUpdate!: Date;
}