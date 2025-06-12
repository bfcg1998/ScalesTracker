import { 
  users, 
  scales, 
  units, 
  assignments, 
  auditLogs,
  type User, 
  type InsertUser,
  type Scale,
  type InsertScale,
  type Unit,
  type InsertUnit,
  type Assignment,
  type InsertAssignment,
  type AuditLog,
  type InsertAuditLog,
  type ScaleWithAssignment,
  type AssignmentWithDetails
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, gte, lte, isNull, count, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByDodId(dodId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;
  getUsers(): Promise<User[]>;

  // Scale methods
  getScale(id: number): Promise<Scale | undefined>;
  getScaleByScaleId(scaleId: string): Promise<Scale | undefined>;
  createScale(scale: InsertScale): Promise<Scale>;
  updateScale(id: number, updates: Partial<InsertScale>): Promise<Scale>;
  getScales(): Promise<Scale[]>;
  getScalesWithAssignments(): Promise<ScaleWithAssignment[]>;
  getAvailableScales(): Promise<Scale[]>;
  
  // Unit methods
  getUnits(): Promise<Unit[]>;
  createUnit(unit: InsertUnit): Promise<Unit>;

  // Assignment methods
  createAssignment(assignment: InsertAssignment): Promise<Assignment>;
  getAssignment(id: number): Promise<AssignmentWithDetails | undefined>;
  getActiveAssignments(): Promise<AssignmentWithDetails[]>;
  getAllAssignments(): Promise<AssignmentWithDetails[]>;
  returnAssignment(id: number, returnData: {
    returnedById: number;
    returnCondition: string;
    returnNotes?: string;
  }): Promise<Assignment>;

  // Audit methods
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(filters?: {
    userId?: number;
    scaleId?: number;
    actionType?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AuditLog[]>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalUnits: number;
    inField: number;
    expiring: number;
    expired: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByDodId(dodId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.dodId, dodId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.lastName, users.firstName);
  }

  async getScale(id: number): Promise<Scale | undefined> {
    const [scale] = await db.select().from(scales).where(eq(scales.id, id));
    return scale || undefined;
  }

  async getScaleByScaleId(scaleId: string): Promise<Scale | undefined> {
    const [scale] = await db.select().from(scales).where(eq(scales.scaleId, scaleId));
    return scale || undefined;
  }

  async createScale(insertScale: InsertScale): Promise<Scale> {
    const [scale] = await db
      .insert(scales)
      .values({
        ...insertScale,
        updatedAt: new Date(),
      })
      .returning();
    return scale;
  }

  async updateScale(id: number, updates: Partial<InsertScale>): Promise<Scale> {
    const [scale] = await db
      .update(scales)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(scales.id, id))
      .returning();
    return scale;
  }

  async getScales(): Promise<Scale[]> {
    return await db.select().from(scales).orderBy(scales.scaleId);
  }

  async getScalesWithAssignments(): Promise<ScaleWithAssignment[]> {
    const scalesList = await db
      .select({
        scale: scales,
        assignment: assignments,
        unit: units,
        assignedBy: users,
      })
      .from(scales)
      .leftJoin(
        assignments,
        and(
          eq(scales.id, assignments.scaleId),
          eq(assignments.status, 'active')
        )
      )
      .leftJoin(units, eq(assignments.unitId, units.id))
      .leftJoin(users, eq(assignments.assignedById, users.id))
      .orderBy(scales.scaleId);

    return scalesList.map(row => ({
      ...row.scale,
      currentAssignment: row.assignment ? {
        ...row.assignment,
        unit: row.unit!,
        assignedBy: row.assignedBy!,
      } : undefined,
    }));
  }

  async getAvailableScales(): Promise<Scale[]> {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return await db
      .select()
      .from(scales)
      .where(
        and(
          eq(scales.status, 'available'),
          or(
            isNull(scales.nextCalibrationDate),
            gte(scales.nextCalibrationDate, thirtyDaysFromNow)
          )
        )
      )
      .orderBy(scales.scaleId);
  }

  async getUnits(): Promise<Unit[]> {
    return await db.select().from(units).where(eq(units.isActive, true)).orderBy(units.name);
  }

  async createUnit(insertUnit: InsertUnit): Promise<Unit> {
    const [unit] = await db
      .insert(units)
      .values(insertUnit)
      .returning();
    return unit;
  }

  async createAssignment(insertAssignment: InsertAssignment): Promise<Assignment> {
    const [assignment] = await db
      .insert(assignments)
      .values(insertAssignment)
      .returning();

    // Update scale status to assigned
    await db
      .update(scales)
      .set({ 
        status: 'assigned',
        updatedAt: new Date(),
      })
      .where(eq(scales.id, insertAssignment.scaleId));

    return assignment;
  }

  async getAssignment(id: number): Promise<AssignmentWithDetails | undefined> {
    const [result] = await db
      .select({
        assignment: assignments,
        scale: scales,
        unit: units,
        assignedBy: users,
        returnedBy: {
          id: sql<number>`returned_by.id`,
          firstName: sql<string>`returned_by.first_name`,
          lastName: sql<string>`returned_by.last_name`,
          email: sql<string>`returned_by.email`,
        },
      })
      .from(assignments)
      .innerJoin(scales, eq(assignments.scaleId, scales.id))
      .innerJoin(units, eq(assignments.unitId, units.id))
      .innerJoin(users, eq(assignments.assignedById, users.id))
      .leftJoin(sql`users AS returned_by`, sql`assignments.returned_by_id = returned_by.id`)
      .where(eq(assignments.id, id));

    if (!result) return undefined;

    return {
      ...result.assignment,
      scale: result.scale,
      unit: result.unit,
      assignedBy: result.assignedBy,
      returnedBy: result.returnedBy.id ? result.returnedBy as any : undefined,
    };
  }

  async getActiveAssignments(): Promise<AssignmentWithDetails[]> {
    const results = await db
      .select({
        assignment: assignments,
        scale: scales,
        unit: units,
        assignedBy: users,
      })
      .from(assignments)
      .innerJoin(scales, eq(assignments.scaleId, scales.id))
      .innerJoin(units, eq(assignments.unitId, units.id))
      .innerJoin(users, eq(assignments.assignedById, users.id))
      .where(eq(assignments.status, 'active'))
      .orderBy(desc(assignments.assignedAt));

    return results.map(row => ({
      ...row.assignment,
      scale: row.scale,
      unit: row.unit,
      assignedBy: row.assignedBy,
    }));
  }

  async getAllAssignments(): Promise<AssignmentWithDetails[]> {
    const results = await db
      .select({
        assignment: assignments,
        scale: scales,
        unit: units,
        assignedBy: users,
        returnedBy: {
          id: sql<number>`returned_by.id`,
          firstName: sql<string>`returned_by.first_name`,
          lastName: sql<string>`returned_by.last_name`,
          email: sql<string>`returned_by.email`,
        },
      })
      .from(assignments)
      .innerJoin(scales, eq(assignments.scaleId, scales.id))
      .innerJoin(units, eq(assignments.unitId, units.id))
      .innerJoin(users, eq(assignments.assignedById, users.id))
      .leftJoin(sql`users AS returned_by`, sql`assignments.returned_by_id = returned_by.id`)
      .orderBy(desc(assignments.assignedAt));

    return results.map(row => ({
      ...row.assignment,
      scale: row.scale,
      unit: row.unit,
      assignedBy: row.assignedBy,
      returnedBy: row.returnedBy.id ? row.returnedBy as any : undefined,
    }));
  }

  async returnAssignment(id: number, returnData: {
    returnedById: number;
    returnCondition: string;
    returnNotes?: string;
  }): Promise<Assignment> {
    const [assignment] = await db
      .update(assignments)
      .set({
        status: 'returned',
        returnedAt: new Date(),
        returnedById: returnData.returnedById,
        returnCondition: returnData.returnCondition as any,
        returnNotes: returnData.returnNotes,
      })
      .where(eq(assignments.id, id))
      .returning();

    // Update scale status back to available
    await db
      .update(scales)
      .set({ 
        status: 'available',
        condition: returnData.returnCondition as any,
        updatedAt: new Date(),
      })
      .where(eq(scales.id, assignment.scaleId));

    return assignment;
  }

  async createAuditLog(insertAuditLog: InsertAuditLog): Promise<AuditLog> {
    const [log] = await db
      .insert(auditLogs)
      .values(insertAuditLog)
      .returning();
    return log;
  }

  async getAuditLogs(filters?: {
    userId?: number;
    scaleId?: number;
    actionType?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AuditLog[]> {
    let query = db.select().from(auditLogs);
    
    const conditions = [];
    if (filters?.userId) conditions.push(eq(auditLogs.userId, filters.userId));
    if (filters?.scaleId) conditions.push(eq(auditLogs.scaleId, filters.scaleId));
    if (filters?.actionType) conditions.push(eq(auditLogs.actionType, filters.actionType as any));
    if (filters?.startDate) conditions.push(gte(auditLogs.createdAt, filters.startDate));
    if (filters?.endDate) conditions.push(lte(auditLogs.createdAt, filters.endDate));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(auditLogs.createdAt));
  }

  async getDashboardStats(): Promise<{
    totalUnits: number;
    inField: number;
    expiring: number;
    expired: number;
  }> {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [totalResult] = await db
      .select({ count: count() })
      .from(scales);

    const [inFieldResult] = await db
      .select({ count: count() })
      .from(scales)
      .where(eq(scales.status, 'assigned'));

    const [expiringResult] = await db
      .select({ count: count() })
      .from(scales)
      .where(
        and(
          scales.nextCalibrationDate !== null,
          gte(scales.nextCalibrationDate, now),
          lte(scales.nextCalibrationDate, thirtyDaysFromNow)
        )
      );

    const [expiredResult] = await db
      .select({ count: count() })
      .from(scales)
      .where(
        and(
          scales.nextCalibrationDate !== null,
          lte(scales.nextCalibrationDate, now)
        )
      );

    return {
      totalUnits: totalResult.count,
      inField: inFieldResult.count,
      expiring: expiringResult.count,
      expired: expiredResult.count,
    };
  }
}

export const storage = new DatabaseStorage();
