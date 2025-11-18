import { z } from "zod";

export const createBaseProductSchema = z.object({
  barcode: z.string().trim(),
  internal_code: z.string().trim(),
  name: z
    .string()
    .trim()
    .transform((val) => val.toLowerCase()),
  brand_id: z.number().positive(),
  packaging_type_id: z.number().positive(),
  capacity: z.number().positive(),
  unit_id: z.number().positive(),
  categories: z.array(
    z
      .string()
      .trim()
      .transform((val) => val.toLowerCase())
  ),
  business_types: z.number().positive().array(),
});

export const createProductVariantSchema = z.object({
  productId: z.number().positive(),
  userId: z.number().positive(),
  quantityPerPackage: z.number().positive(),
  price: z.number().positive(),
  stockQuantity: z.number().positive(),
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
      packagingType: z
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
