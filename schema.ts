import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Product categories table
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Products table
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  sku: varchar("sku", { length: 100 }).notNull().unique(),
  categoryId: int("categoryId").notNull(),
  description: text("description"),
  certifications: text("certifications"), // JSON array of certifications
  imageUrl: varchar("imageUrl", { length: 500 }),
  unit: varchar("unit", { length: 50 }), // L, kg, unidad
  price: int("price").notNull(), // cents
  stock: int("stock").default(0).notNull(),
  minStock: int("minStock").default(10).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Stock movements table for predictive analysis
 */
export const stockMovements = mysqlTable("stockMovements", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["in", "out", "adjustment"]).notNull(),
  quantity: int("quantity").notNull(),
  previousStock: int("previousStock").notNull(),
  newStock: int("newStock").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StockMovement = typeof stockMovements.$inferSelect;
export type InsertStockMovement = typeof stockMovements.$inferInsert;

/**
 * Restock orders table
 */
export const restockOrders = mysqlTable("restockOrders", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  userId: int("userId").notNull(),
  quantity: int("quantity").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "completed", "cancelled"]).default("pending").notNull(),
  predictedDate: timestamp("predictedDate"),
  confirmedDate: timestamp("confirmedDate"),
  completedDate: timestamp("completedDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RestockOrder = typeof restockOrders.$inferSelect;
export type InsertRestockOrder = typeof restockOrders.$inferInsert;

/**
 * Incidents table
 */
export const incidents = mysqlTable("incidents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  location: varchar("location", { length: 200 }).notNull(),
  description: text("description").notNull(),
  photoUrl: varchar("photoUrl", { length: 500 }),
  status: mysqlEnum("status", ["open", "in_progress", "resolved"]).default("open").notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
});

export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = typeof incidents.$inferInsert;

/**
 * WhatsApp notifications table
 */
export const whatsappNotifications = mysqlTable("whatsappNotifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["stock_alert", "restock_recommendation", "incident_alert", "certification_update"]).notNull(),
  message: text("message").notNull(),
  productId: int("productId"),
  incidentId: int("incidentId"),
  status: mysqlEnum("status", ["pending", "sent", "failed"]).default("pending").notNull(),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WhatsappNotification = typeof whatsappNotifications.$inferSelect;
export type InsertWhatsappNotification = typeof whatsappNotifications.$inferInsert;

/**
 * Certification levels table
 */
export const certificationLevels = mysqlTable("certificationLevels", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  description: text("description"),
  requiredScore: int("requiredScore").notNull(),
  benefits: text("benefits"), // JSON array
  color: varchar("color", { length: 20 }),
  order: int("order").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CertificationLevel = typeof certificationLevels.$inferSelect;
export type InsertCertificationLevel = typeof certificationLevels.$inferInsert;

/**
 * User certifications table
 */
export const userCertifications = mysqlTable("userCertifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  levelId: int("levelId").notNull(),
  currentScore: int("currentScore").default(0).notNull(),
  progress: int("progress").default(0).notNull(), // 0-100
  achievedAt: timestamp("achievedAt"),
  expiresAt: timestamp("expiresAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserCertification = typeof userCertifications.$inferSelect;
export type InsertUserCertification = typeof userCertifications.$inferInsert;

/**
 * Audit criteria table
 */
export const auditCriteria = mysqlTable("auditCriteria", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  weight: int("weight").default(1).notNull(),
  order: int("order").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditCriteria = typeof auditCriteria.$inferSelect;
export type InsertAuditCriteria = typeof auditCriteria.$inferInsert;

/**
 * Audits table
 */
export const audits = mysqlTable("audits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  auditorId: int("auditorId"),
  overallScore: int("overallScore").default(0).notNull(),
  status: mysqlEnum("status", ["draft", "in_progress", "completed"]).default("draft").notNull(),
  completedAt: timestamp("completedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Audit = typeof audits.$inferSelect;
export type InsertAudit = typeof audits.$inferInsert;

/**
 * Audit results table
 */
export const auditResults = mysqlTable("auditResults", {
  id: int("id").autoincrement().primaryKey(),
  auditId: int("auditId").notNull(),
  criteriaId: int("criteriaId").notNull(),
  status: mysqlEnum("status", ["pass", "fail", "pending"]).default("pending").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AuditResult = typeof auditResults.$inferSelect;
export type InsertAuditResult = typeof auditResults.$inferInsert;

/**
 * Environmental impact tracking
 */
export const environmentalImpact = mysqlTable("environmentalImpact", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  co2Saved: int("co2Saved").default(0).notNull(), // grams
  waterSaved: int("waterSaved").default(0).notNull(), // liters
  wasteReduced: int("wasteReduced").default(0).notNull(), // grams
  month: int("month").notNull(),
  year: int("year").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EnvironmentalImpact = typeof environmentalImpact.$inferSelect;
export type InsertEnvironmentalImpact = typeof environmentalImpact.$inferInsert;
