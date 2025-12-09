import mysql from "mysql2/promise";

async function seed() {
  console.log("🌱 Seeding database...");
  
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    // Seed product categories
    await connection.query(`
      INSERT INTO categories (name, slug, description) VALUES
      ('Desinfectantes', 'desinfectantes', 'Productos desinfectantes de amplio espectro'),
      ('Detergentes', 'detergentes', 'Detergentes industriales y especializados'),
      ('Sanitizantes', 'sanitizantes', 'Sanitizantes para superficies y manos')
    `);
    console.log("✅ Product categories seeded");

    // Get category IDs
    const [categories] = await connection.query('SELECT id, slug FROM categories');
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.slug] = cat.id;
    });

    // Seed products
    await connection.query(`
      INSERT INTO products (name, sku, categoryId, description, price, stock, minStock, unit, certifications) VALUES
      ('Desinfectante Multiuso', 'DES-001', ?, 'Desinfectante de amplio espectro para superficies', 8500, 45, 15, 'litro', '["NSF","EPA"]'),
      ('Amonio Cuaternario 5G', 'DES-002', ?, 'Desinfectante de quinta generación', 12000, 8, 10, 'litro', '["NSF","ISP"]'),
      ('Detergente Clorado', 'DET-001', ?, 'Detergente con acción blanqueadora', 6500, 30, 12, 'litro', '["NSF"]'),
      ('Limpiador Multiuso', 'DET-002', ?, 'Limpiador para todo tipo de superficies', 5500, 35, 15, 'litro', '["NSF"]'),
      ('Sanitizante Alimentario', 'SAN-001', ?, 'Sanitizante apto para contacto con alimentos', 9500, 20, 10, 'litro', '["NSF","FDA"]'),
      ('Alcohol Gel', 'SAN-002', ?, 'Alcohol gel para manos 70%', 4500, 50, 20, 'litro', '["ISP"]')
    `, [
      categoryMap.desinfectantes,
      categoryMap.desinfectantes,
      categoryMap.detergentes,
      categoryMap.detergentes,
      categoryMap.sanitizantes,
      categoryMap.sanitizantes
    ]);
    console.log("✅ Products seeded");

    // Seed certification levels
    await connection.query(`
      INSERT INTO certificationLevels (name, slug, description, requiredScore, \`order\`, benefits, color) VALUES
      ('Bronze', 'bronze', 'Nivel básico de certificación en higiene y seguridad', 60, 1, '["Acceso al portal","Reporte mensual","Soporte básico"]', '#CD7F32'),
      ('Silver', 'silver', 'Nivel intermedio de certificación con auditorías regulares', 75, 2, '["Todo Bronze","Auditorías trimestrales","Soporte prioritario","Badge de certificación"]', '#C0C0C0'),
      ('Gold', 'gold', 'Nivel avanzado de certificación con acompañamiento profesional', 90, 3, '["Todo Silver","Auditorías mensuales","Consultoría incluida","Reconocimiento público"]', '#FFD700')
    `);
    console.log("✅ Certification levels seeded");

    // Seed audit criteria
    await connection.query(`
      INSERT INTO auditCriteria (name, description, category, weight, \`order\`) VALUES
      ('Uso correcto de EPP', 'Personal utiliza equipo de protección personal adecuado (guantes, mascarillas, gafas)', 'seguridad', 10, 1),
      ('Manipulación segura de químicos', 'Productos químicos se manipulan según protocolos de seguridad establecidos', 'seguridad', 15, 2),
      ('Almacenamiento adecuado', 'Productos almacenados en condiciones apropiadas (temperatura, ventilación, separación)', 'almacenamiento', 10, 3),
      ('Rotulación y fichas técnicas', 'Todos los productos están correctamente rotulados y cuentan con fichas técnicas actualizadas', 'documentacion', 10, 4),
      ('Control de residuos', 'Sistema de gestión de residuos químicos implementado y funcionando', 'medio_ambiente', 10, 5),
      ('Capacitación del personal', 'Personal capacitado en uso seguro de productos y procedimientos de emergencia', 'capacitacion', 15, 6),
      ('Registro de incidentes', 'Sistema de registro y seguimiento de incidentes implementado', 'documentacion', 10, 7)
    `);
    console.log("✅ Audit criteria seeded");

    console.log("🎉 Seeding completed successfully!");
  } finally {
    await connection.end();
  }
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
