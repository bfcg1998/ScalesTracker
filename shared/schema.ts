import { pgTable, text, serial, integer, boolean, timestamp, varchar, pgEnum, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'technician', 'auditor', 'viewer']);
export const scaleStatusEnum = pgEnum('scale_status', ['available', 'assigned', 'maintenance', 'retired']);
export const assignmentStatusEnum = pgEnum('assignment_status', ['active', 'returned', 'overdue']);
export const conditionEnum = pgEnum('condition', ['excellent', 'good', 'fair', 'needs_maintenance', 'damaged']);
export const actionTypeEnum = pgEnum('action_type', ['assigned', 'returned', 'calibrated', 'created', 'updated']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  dodId: varchar("dod_id", { length: 50 }).notNull().unique(),
  password: text("password").notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  role: userRoleEnum("role").notNull().default('viewer'),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Units table
export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Scales table
export const scales = pgTable("scales", {
  id: serial("id").primaryKey(),
  scaleId: varchar("scale_id", { length: 50 }).notNull().unique(),
  serialNumber: varchar("serial_number", { length: 100 }).notNull().unique(),
  model: varchar("model", { length: 200 }).notNull(),
  manufacturer: varchar("manufacturer", { length: 100 }).notNull(),
  capacity: varchar("capacity", { length: 50 }).notNull(),
  status: scaleStatusEnum("status").notNull().default('available'),
  location: varchar("location", { length: 255 }),
  calibrationDate: timestamp("calibration_date"),
  nextCalibrationDate: timestamp("next_calibration_date"),
  calibrationInterval: integer("calibration_interval").notNull().default(730), // days, default 2 years
  condition: conditionEnum("condition").notNull().default('excellent'),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Assignments table
export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  scaleId: integer("scale_id").notNull().references(() => scales.id),
  unitId: integer("unit_id").notNull().references(() => units.id),
  assignedToPersonName: varchar("assigned_to_person_name", { length: 255 }).notNull(),
  assignedById: integer("assigned_by_id").notNull().references(() => users.id),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  expectedReturnDate: timestamp("expected_return_date"),
  returnedAt: timestamp("returned_at"),
  returnedById: integer("returned_by_id").references(() => users.id),
  returnCondition: conditionEnum("return_condition"),
  assignmentNotes: text("assignment_notes"),
  returnNotes: text("return_notes"),
  status: assignmentStatusEnum("status").notNull().default('active'),
  location: varchar("location", { length: 255 }),
});

// Audit logs table
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  scaleId: integer("scale_id").references(() => scales.id),
  assignmentId: integer("assignment_id").references(() => assignments.id),
  actionType: actionTypeEnum("action_type").notNull(),
  description: text("description").notNull(),
  metadata: text("metadata"), // JSON string for additional data
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  assignments: many(assignments, { relationName: "assignedBy" }),
  returns: many(assignments, { relationName: "returnedBy" }),
  auditLogs: many(auditLogs),
}));

export const unitsRelations = relations(units, ({ many }) => ({
  assignments: many(assignments),
}));

export const scalesRelations = relations(scales, ({ many }) => ({
  assignments: many(assignments),
  auditLogs: many(auditLogs),
}));

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  scale: one(scales, {
    fields: [assignments.scaleId],
    references: [scales.id],
  }),
  unit: one(units, {
    fields: [assignments.unitId],
    references: [units.id],
  }),
  assignedBy: one(users, {
    fields: [assignments.assignedById],
    references: [users.id],
    relationName: "assignedBy",
  }),
  returnedBy: one(users, {
    fields: [assignments.returnedById],
    references: [users.id],
    relationName: "returnedBy",
  }),
  auditLogs: many(auditLogs),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
  scale: one(scales, {
    fields: [auditLogs.scaleId],
    references: [scales.id],
  }),
  assignment: one(assignments, {
    fields: [auditLogs.assignmentId],
    references: [assignments.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});

export const insertUnitSchema = createInsertSchema(units).omit({
  id: true,
  createdAt: true,
});

export const insertScaleSchema = createInsertSchema(scales).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  assignedAt: true,
  returnedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Unit = typeof units.$inferSelect;
export type InsertUnit = z.infer<typeof insertUnitSchema>;
export type Scale = typeof scales.$inferSelect;
export type InsertScale = z.infer<typeof insertScaleSchema>;
export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// Extended types for joined queries
export type ScaleWithAssignment = Scale & {
  currentAssignment?: Assignment & {
    unit: Unit;
    assignedBy: User;
  };
};

export type AssignmentWithDetails = Assignment & {
  scale: Scale;
  unit: Unit;
  assignedBy: User;
  returnedBy?: User;
};
