import "express-session";

declare module "express-session" {
    interface SessionData {
        userId: number;
    }
}
declare global {
    namespace Express {
        interface AuthUser {
            id: number;
            email: string;
            name: string;
            roles: string[];
            permissions: string[];
        }
        interface Request {
            user?: AuthUser;
        }
    }
}


export { };
