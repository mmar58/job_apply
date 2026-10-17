// Single source of truth for permissions and the default roles.

export const PERMISSIONS = {
    JOB_CREATE: "job:create",
    JOB_UPDATE: "job:update",
    JOB_DELETE: "job:delete",
    JOB_VIEW_ALL: "job:view_all",
    APPLICATION_APPLY: "application:apply",
    APPLICATION_VIEW_OWN: "application:view_own",
    APPLICATION_VIEW_ALL: "application:view_all",
    APPLICATION_REVIEW: "application:review",
    PROFILE_MANAGE: "profile:manage",
    USER_CREATE: "user:create",
    USER_VIEW: "user:view",
    AI_USE: "ai:use",
    DASHBOARD_ADMIN: "dashboard:admin",
    DASHBOARD_CANDIDATE: "dashboard:candidate",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_DESCRIPTIONS: Record<PermissionKey, string> = {
    "job:create": "Create job posts",
    "job:update": "Edit job posts",
    "job:delete": "Delete job posts",
    "job:view_all": "View all jobs including drafts and closed",
    "application:apply": "Apply for jobs",
    "application:view_own": "View own applications",
    "application:view_all": "View all applications",
    "application:review": "Approve or reject applications",
    "profile:manage": "Manage own candidate profile",
    "user:create": "Create users with elevated roles",
    "user:view": "View users",
    "ai:use": "Use AI assistance features",
    "dashboard:admin": "Access the admin dashboard",
    "dashboard:candidate": "Access the candidate dashboard",
};

export const ROLE_DEFINITIONS: {
    name: string;
    description: string;
    permissions: PermissionKey[];
}[] = [
        {
            name: "admin",
            description: "Manages jobs and reviews applications",
            permissions: [
                PERMISSIONS.JOB_CREATE,
                PERMISSIONS.JOB_UPDATE,
                PERMISSIONS.JOB_DELETE,
                PERMISSIONS.JOB_VIEW_ALL,
                PERMISSIONS.APPLICATION_VIEW_ALL,
                PERMISSIONS.APPLICATION_REVIEW,
                PERMISSIONS.USER_CREATE,
                PERMISSIONS.USER_VIEW,
                PERMISSIONS.AI_USE,
                PERMISSIONS.DASHBOARD_ADMIN,
            ],
        },
        {
            name: "candidate",
            description: "Looks for jobs and applies",
            permissions: [
                PERMISSIONS.APPLICATION_APPLY,
                PERMISSIONS.APPLICATION_VIEW_OWN,
                PERMISSIONS.PROFILE_MANAGE,
                PERMISSIONS.DASHBOARD_CANDIDATE,
            ],
        },
    ];

// Role assigned to users who sign up through the public registration form.
export const DEFAULT_SIGNUP_ROLE = "candidate";
