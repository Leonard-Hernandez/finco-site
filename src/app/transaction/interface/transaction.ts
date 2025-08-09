import Decimal from "decimal.js";
import { Account } from "../account/interface/account.interface";
import { Goal } from "../goal/interface/goal";

export class Transaction {
    id!: number;
    userId!: number;
    account!: Account;
    type!: string;
    amount!: Decimal;
    fee!: Decimal;
    date!: Date;
    description!: string;
    category!: string;
    goal!: Goal;
    trasnferAccount!: Account;
    exchamgeRate!: Decimal;
}