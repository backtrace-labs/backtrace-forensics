export interface User {
    uid: number;
    email: string;
    username: string;
    role?: string;
    superuser?: number;
    active?: number;
    method?: string;
    universe?: number;
    deleted?: number;
}
