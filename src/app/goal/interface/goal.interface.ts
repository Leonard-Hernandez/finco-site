import { GoalAccountBalance } from "./goalAccountBalance.interface";

export class Goal {
    id!: number;
    name!: string;
    targetAmount!: number;
    deadline!: Date;
    description!: string;
    creationDate!: Date;
    isEnable!: boolean;
    goalAccountBalances!: GoalAccountBalance[];
}