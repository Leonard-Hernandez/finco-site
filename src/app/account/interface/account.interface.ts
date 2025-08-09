import Decimal from "decimal.js";

export class Account {
    id!: number;
    userId!: number;
    name!: string;
    type!: string;
    balance!: Decimal;
    currency!: string;
    creationDate!: Date;
    description!: string;
    isDefault!: boolean;
    isEnable!: boolean;
    withdrawFee!: number;
    depositFee!: number;
}