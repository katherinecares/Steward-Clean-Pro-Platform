import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  console.log("🌱 Seeding database...");

  // Seed product categories first
  const categories = [
    {
      name: "Desinfectantes",
      slug: "desinfectantes",
      description: "Productos desinfectantes de amplio espectro",
    },
    {
      name: "Detergentes",
      slug: "detergentes",
      description: "Detergentes industriales y especializados",
    },
    {
      name: "Sanitizantes",
      slug: "sanitizantes",
      description: "Sanitizantes para superficies y manos",
    },
  ];

  const insertedCategories = await db.insert(schema.productCategories).values(categories).$returningId();
  console.log("✅ Product categories seeded");

  const categoryMap = {
    desinfectantes: insertedCategories[0].id,
    detergentes: insertedCategories[1].id,
    sanitizantes: insertedCategories[2].id,
  };

  // Seed products
  const products = [
    {
      name: "Desinfectante Multiuso",
      sku: "DES-001",
      categoryId: categoryMap.desinfectantes,
      description: "Desinfectante de amplio espectro para superficies",
      price: 8500,
      stock: 45,
      minStock: 15,
      unit: "litro",
      certifications: JSON.stringify(["NSF", "EPA"]),
    },
    {
      name: "Amonio Cuaternario 5G",
      sku: "DES-002",
      categoryId: categoryMap.desinfectantes,
      description: "Desinfectante de quinta generación",
      price: 12000,
      stock: 8,
      minStock: 10,
      unit: "litro",
      certifications: JSON.stringify(["NSF", "ISP"]),
    },
    {
      name: "Detergente Clorado",
      sku: "DET-001",
      categoryId: categoryMap.detergentes,
      description: "Detergente con acción blanqueadora",
      price: 6500,
      stock: 30,
      minStock: 12,
      unit: "litro",
      certifications: JSON.stringify(["NSF"]),
    },
    {
      name: "Limpiador Multiuso",
      sku: "DET-002",
      categoryId: categoryMap.detergentes,
      description: "Limpiador para todo tipo de superficies",
      price: 5500,
      stock: 35,
      minStock: 15,
      unit: "litro",
      certifications: JSON.stringify(["NSF"]),
    },
    {
      name: "Sanitizante Alimentario",
      sku: "SAN-001",
      categoryId: categoryMap.sanitizantes,
      description: "Sanitizante apto para contacto con alimentos",
      price: 9500,
      stock: 20,
      minStock: 10,
      unit: "litro",
      certifications: JSON.stringify(["NSF", "FDA"]),
    },
    {
      name: "Alcohol Gel",
      sku: "SAN-002",
      categoryId: categoryMap.sanitizantes,
      description: "Alcohol gel para manos 70%",
      price: 4500,
      stock: 50,
      minStock: 20,
      unit: "litro",
      certifications: JSON.stringify(["ISP"]),
    },
  ];

  await db.insert(schema.products).values(products);
  console.log("✅ Products seeded");

  // Seed certification levels
  const levels = [
    {
      name: "Bronze",
      slug: "bronze",
      description: "Nivel básico de certificación en higiene y seguridad",
      requiredScore: 60,
      order: 1,
      benefits: JSON.stringify(["Acceso al portal", "Reporte mensual", "Soporte básico"]),
      color: "#CD7F32",
    },
    {
      name: "Silver",
      slug: "silver",
      description: "Nivel intermedio de certificación con auditorías regulares",
      requiredScore: 75,
      order: 2,
      benefits: JSON.stringify(["Todo Bronze", "Auditorías trimestrales", "Soporte prioritario", "Badge de certificación"]),
      color: "#C0C0C0",
    },
    {
      name: "Gold",
      slug: "gold",
      description: "Nivel avanzado de certificación con acompañamiento profesional",
      requiredScore: 90,
      order: 3,
      benefits: JSON.stringify(["Todo Silver", "Auditorías mensuales", "Consultoría incluida", "Reconocimiento público"]),
      color: "#FFD700",
    },
  ];

  await db.insert(schema.certificationLevels).values(levels);
  console.log("✅ Certification levels seeded");

  // Seed audit criteria
  const criteria = [
    {
      name: "Uso correcto de EPP",
      description: "Personal utiliza equipo de protección personal adecuado (guantes, mascarillas, gafas)",
      category: "seguridad",
      weight: 10,
    },
    {
      name: "Manipulación segura de químicos",
      description: "Productos químicos se manipulan según protocolos de seguridad establecidos",
      category: "seguridad",
      weight: 15,
    },
    {
      name: "Almacenamiento adecuado",
      description: "Productos almacenados en condiciones apropiadas (temperatura, ventilación, separación)",
      category: "almacenamiento",
      weight: 10,
    },
    {
      name: "Rotulación y fichas técnicas",
      description: "Todos los productos están correctamente rotulados y cuentan con fichas técnicas actualizadas",
      category: "documentacion",
      weight: 10,
    },
    {
      name: "Control de residuos",
      description: "Sistema de gestión de residuos químicos implementado y funcionando",
      category: "medio_ambiente",
      weight: 10,
    },
    {
      name: "Capacitación del personal",
      description: "Personal capacitado en uso seguro de productos y procedimientos de emergencia",
      category: "capacitacion",
      weight: 15,
    },
    {
      name: "Registro de incidentes",
      description: "Sistema de registro y seguimiento de incidentes implementado",
      category: "documentacion",
      weight: 10,
    },
  ];

  await db.insert(schema.auditCriteria).values(criteria);
  console.log("✅ Audit criteria seeded");

  console.log("🎉 Seeding completed successfully!");
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
