import { PrismaClient, UnitOfMeasure } from "@prisma/client";

const prisma = new PrismaClient();

async function seedUnitOfMeasures() {
  const unitOfMeasures = [
    { id: 1, unit: "UN", description: "Unidad" },
    { id: 2, unit: "PAQ", description: "Paquete" },
    { id: 3, unit: "CJ", description: "Caja" },
    { id: 4, unit: "BLS", description: "Bolsa" },
    { id: 5, unit: "LT", description: "Litro" },
    { id: 6, unit: "ML", description: "Mililitro" },
    { id: 7, unit: "KG", description: "Kilogramo" },
    { id: 8, unit: "G", description: "Gramo" },
    { id: 9, unit: "MG", description: "Miligramo" },
    { id: 10, unit: "DZ", description: "Docena" },
    { id: 11, unit: "M", description: "Metro" },
    { id: 12, unit: "CM", description: "Centímetro" },
    { id: 13, unit: "PAR", description: "Par" },
    { id: 14, unit: "ROLLO", description: "Rollo" },
    { id: 15, unit: "BOT", description: "Botella" },
    { id: 16, unit: "LAT", description: "Lata" },
    { id: 17, unit: "FRASCO", description: "Frasco" },
    { id: 18, unit: "BANDEJA", description: "Bandeja" },
    { id: 19, unit: "SOBRE", description: "Sobre" },
    {
      id: 20,
      unit: "BLISTER",
      description: "Blíster (empaque con varios artículos)",
    },
    { id: 21, unit: "TUBO", description: "Tubo o pomo" },
    { id: 22, unit: "GAL", description: "Galón" },
    { id: 25, unit: "BARRA", description: "Barra o tableta" },
    { id: 26, unit: "TIRA", description: "Tira de productos" },
    { id: 27, unit: "SET", description: "Juego o set" },
  ];
  try {
    const results = await Promise.all(
      unitOfMeasures.map((uom: Omit<UnitOfMeasure, "id">) =>
        prisma.unitOfMeasure.upsert({
          where: { unit: uom.unit },
          update: {},
          create: {
            unit: uom.unit,
            description: uom.description,
          },
        })
      )
    );

    console.log(`✅ unitOfMeasures seeded`);
    return results;
  } catch (error) {
    console.error("❌ Error in unitOfMeasures seed:", error);
    throw error;
  }
}

// Esta es la función principal que exportaremos
export async function seed() {
  try {
    const results = await seedUnitOfMeasures();
    // Aquí podrías agregar más funciones de seed para otras entidades
    return results;
  } catch (error) {
    console.error("Error en el proceso de seed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Solo ejecuta la función si este archivo se ejecuta directamente
if (require.main === module) {
  seed().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

// Exporta la función para usarla en otros archivos
export default seed;
