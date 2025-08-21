export interface User {
    id: number;
    name: string;
    email: string;
    defaultCurrency: string;
    registrationDate : Date;
    enabled : boolean;
}