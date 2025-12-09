import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============= PRODUCTS MODULE =============
  products: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllProducts();
    }),
    
    byCategory: protectedProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductsByCategory(input.categoryId);
      }),
    
    byId: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductById(input.id);
      }),
    
    lowStock: protectedProcedure.query(async () => {
      return await db.getLowStockProducts();
    }),
    
    categories: protectedProcedure.query(async () => {
      return await db.getAllCategories();
    }),
  }),

  // ============= RESTOCK MODULE =============
  restock: router({
    pending: protectedProcedure.query(async () => {
      return await db.getPendingRestockOrders();
    }),
    
    create: protectedProcedure
      .input(z.object({
        productId: z.number(),
        quantity: z.number(),
        predictedDate: z.date().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const orderId = await db.createRestockOrder({
          ...input,
          userId: ctx.user.id,
        });
        
        // Create notification
        const product = await db.getProductById(input.productId);
        if (product) {
          await db.createWhatsAppNotification({
            userId: ctx.user.id,
            type: "restock_recommendation",
            message: `Reposición recomendada: ${product.name} - ${input.quantity} unidades`,
            productId: product.id,
          });
        }
        
        return { success: true, orderId };
      }),
    
    confirm: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateRestockOrderStatus(input.id, "confirmed", new Date());
        return { success: true };
      }),
    
    complete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.updateRestockOrderStatus(input.id, "completed", new Date());
        return { success: true };
      }),
    
    movements: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return await db.getStockMovementsByProduct(input.productId);
      }),
  }),

  // ============= DASHBOARD MODULE =============
  dashboard: router({
    summary: protectedProcedure.query(async ({ ctx }) => {
      const lowStockProducts = await db.getLowStockProducts();
      const userCert = await db.getUserCertification(ctx.user.id);
      const latestAudit = await db.getLatestAudit(ctx.user.id);
      
      const now = new Date();
      const envImpact = await db.getEnvironmentalImpact(
        ctx.user.id,
        now.getMonth() + 1,
        now.getFullYear()
      );
      
      return {
        stockAlerts: lowStockProducts.length,
        certificationLevel: userCert?.levelId || 1,
        certificationProgress: userCert?.progress || 0,
        complianceScore: latestAudit?.overallScore || 0,
        environmentalImpact: {
          co2Saved: envImpact?.co2Saved || 0,
          waterSaved: envImpact?.waterSaved || 0,
          wasteReduced: envImpact?.wasteReduced || 0,
        },
      };
    }),
  }),

  // ============= INCIDENTS MODULE =============
  incidents: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "admin") {
        return await db.getAllIncidents();
      }
      return await db.getIncidentsByUser(ctx.user.id);
    }),
    
    create: protectedProcedure
      .input(z.object({
        location: z.string(),
        description: z.string(),
        photoUrl: z.string().optional(),
        severity: z.enum(["low", "medium", "high", "critical"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const incidentId = await db.createIncident({
          ...input,
          userId: ctx.user.id,
        });
        
        // Create notification
        await db.createWhatsAppNotification({
          userId: ctx.user.id,
          type: "incident_alert",
          message: `Nuevo incidente reportado: ${input.location}`,
          incidentId,
        });
        
        return { success: true, incidentId };
      }),
    
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["open", "in_progress", "resolved"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateIncidentStatus(input.id, input.status);
        return { success: true };
      }),
  }),

  // ============= NOTIFICATIONS MODULE =============
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getNotificationsByUser(ctx.user.id);
    }),
    
    markSent: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.markNotificationAsSent(input.id);
        return { success: true };
      }),
  }),

  // ============= CERTIFICATION MODULE =============
  certification: router({
    levels: protectedProcedure.query(async () => {
      return await db.getAllCertificationLevels();
    }),
    
    userStatus: protectedProcedure.query(async ({ ctx }) => {
      const userCert = await db.getUserCertification(ctx.user.id);
      const levels = await db.getAllCertificationLevels();
      
      return {
        current: userCert,
        levels,
      };
    }),
    
    updateProgress: protectedProcedure
      .input(z.object({
        currentScore: z.number(),
        progress: z.number(),
        levelId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateUserCertification(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // ============= AUDIT MODULE =============
  audit: router({
    criteria: protectedProcedure.query(async () => {
      return await db.getAllAuditCriteria();
    }),
    
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getAuditsByUser(ctx.user.id);
    }),
    
    latest: protectedProcedure.query(async ({ ctx }) => {
      const audit = await db.getLatestAudit(ctx.user.id);
      if (!audit) return null;
      
      const results = await db.getAuditResults(audit.id);
      const criteria = await db.getAllAuditCriteria();
      
      return {
        audit,
        results,
        criteria,
      };
    }),
    
    create: protectedProcedure.mutation(async ({ ctx }) => {
      const auditId = await db.createAudit({
        userId: ctx.user.id,
      });
      
      // Initialize all criteria as pending
      const criteria = await db.getAllAuditCriteria();
      for (const criterion of criteria) {
        await db.createAuditResult({
          auditId,
          criteriaId: criterion.id,
          status: "pending",
        });
      }
      
      return { success: true, auditId };
    }),
    
    updateResult: protectedProcedure
      .input(z.object({
        auditId: z.number(),
        criteriaId: z.number(),
        status: z.enum(["pass", "fail", "pending"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createAuditResult(input);
        
        // Recalculate overall score
        const results = await db.getAuditResults(input.auditId);
        const passCount = results.filter(r => r.status === "pass").length;
        const totalCount = results.length;
        const score = totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0;
        
        await db.updateAuditScore(input.auditId, score);
        
        return { success: true, score };
      }),
  }),
});

export type AppRouter = typeof appRouter;
