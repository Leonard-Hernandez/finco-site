import { Page, Pagination } from "@app/shared/interfaces/pagination.interface";

export interface Account {
    id?: number;
    userId?: number;
    name: string;
    type: string;
    balance?: number;
    currency: string;
    creationDate?: Date;
    description?: string;
    isDefault?: boolean;
    isEnable?: boolean;
    withdrawFee?: number;
    depositFee?: number;
}

export interface Total {
    total: number;
    currency: string;
}

export interface AccountResponse {
    content: Account[];
    page: Page;
}

export interface AccountFilter {
    pagination: Pagination;
    currency?: string;
    type?: string;
    userId?: number;
}
    