import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users,
  categories, products, stockMovements, restockOrders,
  incidents, whatsappNotifications, certificationLevels,
  userCertifications, auditCriteria, audits, auditResults,
  environmentalImpact,
  type Product, type Category, type StockMovement,
  type RestockOrder, type Incident, type WhatsappNotification,
  type CertificationLevel, type UserCertification,
  type AuditCriteria, type Audit, type AuditResult,
  type EnvironmentalImpact
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============= USER OPERATIONS =============
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============= PRODUCT OPERATIONS =============
export async function getAllCategories(): Promise<Category[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(categories).orderBy(categories.name);
}

export async function getAllProducts(): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products).where(eq(products.isActive, true)).orderBy(products.name);
}

export async function getProductsByCategory(categoryId: number): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products)
    .where(and(eq(products.categoryId, categoryId), eq(products.isActive, true)))
    .orderBy(products.name);
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function getLowStockProducts(): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products)
    .where(and(
      eq(products.isActive, true),
      sql`${products.stock} <= ${products.minStock}`
    ))
    .orderBy(products.name);
}

// ============= STOCK OPERATIONS =============
export async function createStockMovement(movement: {
  productId: number;
  userId: number;
  type: "in" | "out" | "adjustment";
  quantity: number;
  previousStock: number;
  newStock: number;
  notes?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(stockMovements).values(movement);
}

export async function getStockMovementsByProduct(productId: number, limit = 50): Promise<StockMovement[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(stockMovements)
    .where(eq(stockMovements.productId, productId))
    .orderBy(desc(stockMovements.createdAt))
    .limit(limit);
}

// ============= RESTOCK OPERATIONS =============
export async function createRestockOrder(order: {
  productId: number;
  userId: number;
  quantity: number;
  predictedDate?: Date;
  notes?: string;
}): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.insert(restockOrders).values(order);
  return Number(result[0].insertId);
}

export async function getPendingRestockOrders(): Promise<RestockOrder[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(restockOrders)
    .where(eq(restockOrders.status, "pending"))
    .orderBy(desc(restockOrders.createdAt));
}

export async function updateRestockOrderStatus(
  id: number,
  status: "pending" | "confirmed" | "completed" | "cancelled",
  date?: Date
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const updateData: any = { status };
  if (status === "confirmed" && date) updateData.confirmedDate = date;
  if (status === "completed" && date) updateData.completedDate = date;
  
  await db.update(restockOrders).set(updateData).where(eq(restockOrders.id, id));
}

// ============= INCIDENT OPERATIONS =============
export async function createIncident(incident: {
  userId: number;
  location: string;
  description: string;
  photoUrl?: string;
  severity?: "low" | "medium" | "high" | "critical";
}): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.insert(incidents).values(incident);
  return Number(result[0].insertId);
}

export async function getIncidentsByUser(userId: number): Promise<Incident[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(incidents)
    .where(eq(incidents.userId, userId))
    .orderBy(desc(incidents.createdAt));
}

export async function getAllIncidents(): Promise<Incident[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(incidents).orderBy(desc(incidents.createdAt));
}

export async function updateIncidentStatus(
  id: number,
  status: "open" | "in_progress" | "resolved"
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const updateData: any = { status };
  if (status === "resolved") updateData.resolvedAt = new Date();
  
  await db.update(incidents).set(updateData).where(eq(incidents.id, id));
}

// ============= WHATSAPP NOTIFICATIONS =============
export async function createWhatsAppNotification(notification: {
  userId: number;
  type: "stock_alert" | "restock_recommendation" | "incident_alert" | "certification_update";
  message: string;
  productId?: number;
  incidentId?: number;
}): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.insert(whatsappNotifications).values(notification);
  return Number(result[0].insertId);
}

export async function getNotificationsByUser(userId: number, limit = 50): Promise<WhatsappNotification[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(whatsappNotifications)
    .where(eq(whatsappNotifications.userId, userId))
    .orderBy(desc(whatsappNotifications.createdAt))
    .limit(limit);
}

export async function markNotificationAsSent(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(whatsappNotifications)
    .set({ status: "sent", sentAt: new Date() })
    .where(eq(whatsappNotifications.id, id));
}

// ============= CERTIFICATION OPERATIONS =============
export async function getAllCertificationLevels(): Promise<CertificationLevel[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(certificationLevels).orderBy(certificationLevels.order);
}

export async function getUserCertification(userId: number): Promise<UserCertification | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userCertifications)
    .where(and(eq(userCertifications.userId, userId), eq(userCertifications.isActive, true)))
    .limit(1);
  return result[0];
}

export async function updateUserCertification(
  userId: number,
  data: { currentScore: number; progress: number; levelId?: number }
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const existing = await getUserCertification(userId);
  if (existing) {
    await db.update(userCertifications)
      .set(data)
      .where(eq(userCertifications.id, existing.id));
  } else {
    await db.insert(userCertifications).values({
      userId,
      levelId: data.levelId || 1,
      currentScore: data.currentScore,
      progress: data.progress,
    });
  }
}

// ============= AUDIT OPERATIONS =============
export async function getAllAuditCriteria(): Promise<AuditCriteria[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(auditCriteria)
    .where(eq(auditCriteria.isActive, true))
    .orderBy(auditCriteria.order);
}

export async function createAudit(audit: {
  userId: number;
  auditorId?: number;
}): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.insert(audits).values(audit);
  return Number(result[0].insertId);
}

export async function getAuditsByUser(userId: number): Promise<Audit[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(audits)
    .where(eq(audits.userId, userId))
    .orderBy(desc(audits.createdAt));
}

export async function getLatestAudit(userId: number): Promise<Audit | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(audits)
    .where(eq(audits.userId, userId))
    .orderBy(desc(audits.createdAt))
    .limit(1);
  return result[0];
}

export async function createAuditResult(result: {
  auditId: number;
  criteriaId: number;
  status: "pass" | "fail" | "pending";
  notes?: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditResults).values(result);
}

export async function getAuditResults(auditId: number): Promise<AuditResult[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(auditResults)
    .where(eq(auditResults.auditId, auditId));
}

export async function updateAuditScore(auditId: number, score: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(audits)
    .set({ overallScore: score, status: "completed", completedAt: new Date() })
    .where(eq(audits.id, auditId));
}

// ============= ENVIRONMENTAL IMPACT =============
export async function getEnvironmentalImpact(userId: number, month: number, year: number): Promise<EnvironmentalImpact | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(environmentalImpact)
    .where(and(
      eq(environmentalImpact.userId, userId),
      eq(environmentalImpact.month, month),
      eq(environmentalImpact.year, year)
    ))
    .limit(1);
  return result[0];
}

export async function updateEnvironmentalImpact(
  userId: number,
  month: number,
  year: number,
  data: { co2Saved: number; waterSaved: number; wasteReduced: number }
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const existing = await getEnvironmentalImpact(userId, month, year);
  if (existing) {
    await db.update(environmentalImpact)
      .set(data)
      .where(eq(environmentalImpact.id, existing.id));
  } else {
    await db.insert(environmentalImpact).values({
      userId,
      month,
      year,
      ...data,
    });
  }
}
