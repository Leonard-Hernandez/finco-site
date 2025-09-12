import { User } from "@app/auth/interfaces/user.interface";

export interface AuthResponse {
    user: User;
    token: string;
}
