/** finco UserPublicData (GET /users/me). */
export interface User {
    id: number;
    name: string;
    email: string;
    defaultCurrency: string;
    registrationDate : Date;
    enable : boolean;
}
