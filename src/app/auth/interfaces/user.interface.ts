export interface User {
    id: number;
    username: string;
    email: string;
    password: string;
    registrationDat : Date;
    enabled : boolean;
}