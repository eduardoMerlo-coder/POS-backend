import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
    // Configuración correcta para limitar conexiones
    // Prisma maneja automáticamente el pool de conexiones
  });

// Manejo adecuado de conexiones en entornos diferentes
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
} else {
  // En producción (Lambda), asegurarse de liberar conexiones
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
}

// Exponer una función para desconectar explícitamente
export async function disconnectPrisma() {
  try {
    await prisma.$disconnect();
    console.log("Prisma client disconnected successfully");
  } catch (error) {
    console.error("Error disconnecting Prisma client:", error);
  }
}
