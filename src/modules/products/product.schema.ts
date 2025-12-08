import { z } from "zod";

export const createBaseProductSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido"),
  brand_id: z.number().positive("El brand_id debe ser un número positivo"),
  categories: z.array(z.number().positive()).default([]),
});

export const createUserProductVariantSchema = z.object({
  product_base_id: z
    .number()
    .positive("El product_base_id debe ser un número positivo"),
  variant_id: z.number().positive("El variant_id debe ser un número positivo"),
  price: z.number().nonnegative("El precio debe ser un número no negativo"),
  stock_quantity: z
    .number()
    .nonnegative("El stock_quantity debe ser un número no negativo"),
  min_stock: z
    .number()
    .nonnegative("El min_stock debe ser un número no negativo"),
  user_id: z.string().uuid("El user_id debe ser un UUID válido"),
});

export const createProductVariantWithUserSchema = z.object({
  product_base_id: z
    .number()
    .positive("El product_base_id debe ser un número positivo"),
  presentation: z.string().trim().min(1, "La presentación es requerida"),
  capacity: z.number().positive("La capacidad debe ser un número positivo"),
  unit_id: z.number().positive("El unit_id debe ser un número positivo"),
  quantity_per_package: z
    .number()
    .positive("El quantity_per_package debe ser un número positivo"),
  barcode: z.string().trim().min(1, "El barcode es requerido"),
  price: z.number().nonnegative("El precio debe ser un número no negativo"),
  stock_quantity: z
    .number()
    .nonnegative("El stock_quantity debe ser un número no negativo"),
  min_stock: z
    .number()
    .nonnegative("El min_stock debe ser un número no negativo"),
  user_id: z.string().uuid("El user_id debe ser un UUID válido"),
});

export const createProductVariantSchema = createBaseProductSchema.extend({
  user_id: z.string().uuid(),
  price: z.number().nonnegative(),
  stock_quantity: z.number().nonnegative(),
  min_stock: z.number().positive(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export const updateUserProductVariantPriceSchema = z.object({
  user_id: z.string().uuid("El user_id debe ser un UUID válido"),
  variant_id: z.number().positive("El variant_id debe ser un número positivo"),
  price: z.number().nonnegative("El precio debe ser un número no negativo"),
});

export const updateProductSchema = z.object({
  product: z
    .object({
      barcode: z.string().trim().optional(),
      name: z
        .string()
        .trim()
        .transform((val) => val.toLowerCase())
        .optional(),
      brand: z
        .string()
        .trim()
        .transform((val) => val.toLowerCase())
        .optional(),

      // Actualizamos capacity a número también en el esquema de actualización
      capacity: z
        .union([
          z.number().positive(),
          z
            .string()
            .trim()
            .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
              message: "La capacidad debe ser un número positivo",
            }),
        ])
        .transform((val) => Number(val))
        .optional(),

      unitId: z.number().int().positive().optional(),
    })
    .optional(),

  variant: z
    .object({
      id: z.number().int().positive(),
      data: z.object({
        // Mantenemos price como string para Prisma
        price: z
          .union([z.number(), z.string().trim()])
          .transform((val) => String(val))
          .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
            message: "El precio debe ser un número válido mayor o igual a cero",
          })
          .optional(),

        quantityPerPackage: z.number().int().positive().optional(),
        stockQuantity: z.number().int().nonnegative().optional(),
      }),
    })
    .optional(),
});

// Tipos derivados de los esquemas (para usar en tus DTOs)
export type CreateBaseProductDto = z.infer<typeof createBaseProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
export type CreateProductVariantDto = z.infer<
  typeof createProductVariantSchema
>;
export type CreateUserProductVariantDto = z.infer<
  typeof createUserProductVariantSchema
>;
export type CreateProductVariantWithUserDto = z.infer<
  typeof createProductVariantWithUserSchema
>;
export type UpdateUserProductVariantPriceDto = z.infer<
  typeof updateUserProductVariantPriceSchema
>;
