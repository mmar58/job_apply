export type Permission = string;

export type AuthUser = {
    id: number;
    email: string;
    name: string;
    roles: string[];
    permissions: Permission[];
};