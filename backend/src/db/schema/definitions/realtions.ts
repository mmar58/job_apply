import { } from "drizzle-orm/mysql-core"
import { relations, } from "drizzle-orm"
import { users } from "./users.js"
import { roles, userRoles } from "./roles.js"
import { candidateProfiles } from "./candidateProfiles.js"
import { skills, candidateSkills, jobSkills } from "./skills.js"
import { applications } from "./applications.js"
import { permissions, rolePermissions } from "./permission.js"
import { jobs } from "./jobs.js"

// users
export const usersRealtions = relations(users, ({ many, one }) => ({
    userRoles: many(userRoles),
    profile: one(candidateProfiles, {
        fields: [users.id],
        references: [candidateProfiles.id]
    }),
    candidateSkills: many(candidateSkills),
    applications: many(applications)
}));

// roles
export const rolesRealtions = relations(roles, ({ many }) => ({
    userRoles: many(userRoles),
    rolePermissions: many(permissions)
}));

export const userRolesRelations = relations(userRoles, ({ many, one }) => ({
    user: one(users, {
        fields: [userRoles.userId],
        references: [users.id]
    }),
    role: one(roles, {
        fields: [userRoles.roleId],
        references: [roles.id]
    })
}));

// permissions
export const permissionsRealtions = relations(permissions, ({ many }) => ({
    rolePermissions: many(rolePermissions)
}));

export const rolePermissionsRelations = relations(rolePermissions, ({ many, one }) => ({
    role: one(roles, {
        fields: [rolePermissions.roleId],
        references: [roles.id]
    }),
    permission: one(permissions, {
        fields: [rolePermissions.permissionId],
        references: [permissions.id]
    })
}));

//candidateProfiles
export const candidateProfilesRelations = relations(candidateProfiles, ({ one }) => ({
    user: one(users, {
        fields: [candidateProfiles.id],
        references: [users.id]
    })
}));

//skills
export const candidateSkillsRelations = relations(candidateSkills, ({ one }) => ({
    candidate: one(users, {
        fields: [candidateSkills.candidateId],
        references: [users.id]
    }),
    skill: one(skills, {
        fields: [candidateSkills.skillId],
        references: [skills.id]
    })
}));

export const jobSkillsRelations = relations(jobSkills, ({ one }) => ({
    job: one(jobs, {
        fields: [jobSkills.jobId],
        references: [jobs.id]
    }),
    skill: one(skills, {
        fields: [jobSkills.skillId],
        references: [skills.id]
    })
}));

//job
export const jobRelations = relations(jobs, ({ many, one }) => ({
    creator: one(users, {
        fields: [jobs.createdBy],
        references: [users.id]
    }),
    jobSkills: many(jobSkills),
    applications: many(applications)
}));

//applications
export const applicationsRelations = relations(applications, ({ one }) => ({
    candidate: one(users, {
        fields: [applications.candidateId],
        references: [users.id]
    }),
    job: one(jobs, {
        fields: [applications.jobId],
        references: [jobs.id]
    }),
    reviewer: one(users, {
        fields: [applications.reviewedBy],
        references: [users.id]
    }),
}));


