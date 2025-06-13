import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertScaleSchema, insertAssignmentSchema, insertUnitSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import { z } from "zod";

const loginSchema = z.object({
  dodId: z.string().min(1),
  password: z.string().min(1),
});

const assignScaleSchema = z.object({
  scaleId: z.number(),
  unitId: z.number(),
  assignedToPersonName: z.string().min(1),
  expectedReturnDate: z.string().optional(),
  assignmentNotes: z.string().optional(),
  location: z.string().optional(),
});

const returnScaleSchema = z.object({
  returnCondition: z.enum(['excellent', 'good', 'fair', 'needs_maintenance', 'damaged']),
  returnNotes: z.string().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { dodId, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByDodId(dodId);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Update last login
      await storage.updateUser(user.id, { 
        lastLoginAt: new Date() 
      });

      // Log the login
      await storage.createAuditLog({
        userId: user.id,
        actionType: 'updated',
        description: 'User logged in',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Log the creation
      await storage.createAuditLog({
        userId: user.id,
        actionType: 'created',
        description: `User account created: ${user.firstName} ${user.lastName}`,
      });

      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Create user error:', error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  // Units
  app.get("/api/units", async (req, res) => {
    try {
      const units = await storage.getUnits();
      res.json(units);
    } catch (error) {
      console.error('Get units error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/units", async (req, res) => {
    try {
      const unitData = insertUnitSchema.parse(req.body);
      const unit = await storage.createUnit(unitData);
      res.status(201).json(unit);
    } catch (error) {
      console.error('Create unit error:', error);
      res.status(400).json({ message: "Invalid unit data" });
    }
  });

  // Scales
  app.get("/api/scales", async (req, res) => {
    try {
      const scales = await storage.getScalesWithAssignments();
      res.json(scales);
    } catch (error) {
      console.error('Get scales error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/scales/available", async (req, res) => {
    try {
      const scales = await storage.getAvailableScales();
      res.json(scales);
    } catch (error) {
      console.error('Get available scales error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/scales", async (req, res) => {
    try {
      // Convert date strings to Date objects if provided
      const body = { ...req.body };
      if (body.nextCalibrationDate) {
        body.nextCalibrationDate = new Date(body.nextCalibrationDate);
      }
      if (body.calibrationDate) {
        body.calibrationDate = new Date(body.calibrationDate);
      }
      
      const scaleData = insertScaleSchema.parse(body);
      const scale = await storage.createScale(scaleData);

      // Log the creation
      await storage.createAuditLog({
        userId: 1, // TODO: Get from session
        scaleId: scale.id,
        actionType: 'created',
        description: `Scale created: ${scale.scaleId} (${scale.model})`,
      });

      res.status(201).json(scale);
    } catch (error) {
      console.error('Create scale error:', error);
      res.status(400).json({ message: "Invalid scale data" });
    }
  });

  app.patch("/api/scales/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const scale = await storage.updateScale(id, updates);

      // Log the update
      await storage.createAuditLog({
        userId: 1, // TODO: Get from session
        scaleId: scale.id,
        actionType: 'updated',
        description: `Scale updated: ${scale.scaleId}`,
        metadata: JSON.stringify(updates),
      });

      res.json(scale);
    } catch (error) {
      console.error('Update scale error:', error);
      res.status(400).json({ message: "Invalid scale data" });
    }
  });

  // Assignments
  app.get("/api/assignments", async (req, res) => {
    try {
      const assignments = await storage.getAllAssignments();
      res.json(assignments);
    } catch (error) {
      console.error('Get assignments error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/assignments/active", async (req, res) => {
    try {
      const assignments = await storage.getActiveAssignments();
      res.json(assignments);
    } catch (error) {
      console.error('Get active assignments error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/assignments", async (req, res) => {
    try {
      const assignmentData = assignScaleSchema.parse(req.body);
      
      const assignment = await storage.createAssignment({
        scaleId: assignmentData.scaleId,
        unitId: assignmentData.unitId,
        assignedToPersonName: assignmentData.assignedToPersonName,
        assignedById: 1, // TODO: Get from session
        expectedReturnDate: assignmentData.expectedReturnDate ? new Date(assignmentData.expectedReturnDate) : null,
        assignmentNotes: assignmentData.assignmentNotes,
        location: assignmentData.location,
        status: 'active',
      });

      // Log the assignment
      await storage.createAuditLog({
        userId: 1, // TODO: Get from session
        scaleId: assignmentData.scaleId,
        assignmentId: assignment.id,
        actionType: 'assigned',
        description: `Scale assigned to ${assignmentData.assignedToPersonName}`,
        metadata: JSON.stringify({
          unitId: assignmentData.unitId,
          location: assignmentData.location,
        }),
      });

      res.status(201).json(assignment);
    } catch (error) {
      console.error('Create assignment error:', error);
      res.status(400).json({ message: "Invalid assignment data" });
    }
  });

  app.patch("/api/assignments/:id/return", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const returnData = returnScaleSchema.parse(req.body);
      
      const assignment = await storage.returnAssignment(id, {
        returnedById: 1, // TODO: Get from session
        returnCondition: returnData.returnCondition,
        returnNotes: returnData.returnNotes,
      });

      // Log the return
      await storage.createAuditLog({
        userId: 1, // TODO: Get from session
        scaleId: assignment.scaleId,
        assignmentId: assignment.id,
        actionType: 'returned',
        description: `Scale returned in ${returnData.returnCondition} condition`,
        metadata: JSON.stringify({
          returnCondition: returnData.returnCondition,
          returnNotes: returnData.returnNotes,
        }),
      });

      res.json(assignment);
    } catch (error) {
      console.error('Return assignment error:', error);
      res.status(400).json({ message: "Invalid return data" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Audit logs
  app.get("/api/audit-logs", async (req, res) => {
    try {
      const { userId, scaleId, actionType, startDate, endDate } = req.query;
      
      const filters: any = {};
      if (userId) filters.userId = parseInt(userId as string);
      if (scaleId) filters.scaleId = parseInt(scaleId as string);
      if (actionType) filters.actionType = actionType as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const logs = await storage.getAuditLogs(filters);
      res.json(logs);
    } catch (error) {
      console.error('Get audit logs error:', error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
