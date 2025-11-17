import { prisma } from "@/data/postgres";
import { Product, ProductVariant, PrismaClient } from "@prisma/client";
import {
  CreateProductVariantDto,
  CreateBaseProductDto,
} from "../product.schema";
import { UomService } from "@/modules/uom/services/uom.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

// Tipo helper para transacciones de Prisma
type PrismaTransaction = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

export class ProductService {
  constructor(private readonly uomService: UomService = new UomService()) {}

  async createBaseProduct(data: CreateBaseProductDto) {
    try {
      const {
        barcode,
        internal_code = "",
        name,
        brand,
        packaging_type_id,
        capacity,
        unit_id,
        categories,
        business_types,
      } = data;

      return await prisma.$transaction(async (tx: PrismaTransaction) => {
        const existingProduct = await tx.product.findFirst({
          where: {
            barcode,
            internalCode: internal_code,
          },
        });

        if (existingProduct) {
          throw {
            status: 409,
            message: `Ya existe un producto con el mismo código de barras en este tipo de negocio.`,
          };
        }

        const newProduct = await tx.product.create({
          data: {
            barcode,
            internalCode: internal_code,
            name,
            brand,
            capacity,
            unitId: unit_id,
            businessLinks: {
              create: business_types.map((btId) => ({
                businessType: { connect: { id: btId } },
              })),
            },
            packagingTypeId: packaging_type_id,
            productCategories: {
              create: categories.map((categoryName) => ({
                category: {
                  connectOrCreate: {
                    where: { name: categoryName.toLowerCase() },
                    create: { name: categoryName.toLowerCase() },
                  },
                },
              })),
            },
          },
          include: {
            productCategories: { include: { category: true } },
            productVariants: true,
          },
        });

        return newProduct;
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw {
          status: 409,
          message: `Ya existe un producto con el mismo barcode`,
          error: "UniqueConstraintViolation",
        };
      }
      throw error;
    }
  }

  async createProductVariant(data: CreateProductVariantDto) {
    try {
      const { productId, quantityPerPackage, price, stockQuantity, userId } =
        data;
      return await prisma.productVariant.create({
        data: {
          productId,
          quantityPerPackage,
          userVariants: {
            create: {
              userId,
              price,
              stockQuantity,
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }
  async getProductsByUser(userId: number) {
    try {
      const listProduct = await prisma.product.findMany({
        where: {
          productVariants: {
            some: {
              userVariants: {
                some: { userId },
              },
            },
          },
        },
        include: {
          productCategories: {
            include: {
              category: true,
            },
          },
          unitOfMeasure: true,
        },
      });
      return listProduct;
    } catch (error) {
      throw error;
    }
  }

  async getAllBaseProducts() {
    try {
      const products = await prisma.product.findMany({
        include: { unitOfMeasure: { select: { unit: true } } },
      });
      return products;
    } catch (error: any) {
      throw error;
    }
  }

  /**======================= OLD END POINTS ========================*/
  async updateProduct(id: number, data: Product) {
    try {
      const product = await prisma.product.update({
        where: { id },
        data,
      });
      return product;
    } catch (error: any) {
      throw error;
    }
  }

  async updateProductWithVariant(
    productId: number,
    data: {
      product?: Partial<Product>;
      variant?: {
        id: number;
        data: Partial<Omit<ProductVariant, "id" | "productId">>;
      };
    }
  ) {
    try {
      return await prisma.$transaction(async (tx: PrismaTransaction) => {
        let updatedProduct;
        let updatedVariant;

        // Actualizar el producto si se proporcionaron datos
        if (data.product && Object.keys(data.product).length > 0) {
          updatedProduct = await tx.product.update({
            where: { id: productId },
            data: data.product,
            include: {
              unitOfMeasure: true,
              productCategories: {
                include: {
                  category: true,
                },
              },
            },
          });
        } else {
          // Si no se actualizó, al menos obtener el producto actual
          updatedProduct = await tx.product.findUnique({
            where: { id: productId },
            include: {
              unitOfMeasure: true,
              productCategories: {
                include: {
                  category: true,
                },
              },
            },
          });
        }

        // Actualizar la variante si se proporcionaron datos
        if (
          data.variant &&
          data.variant.id &&
          Object.keys(data.variant.data).length > 0
        ) {
          updatedVariant = await tx.productVariant.update({
            where: {
              id: data.variant.id,
              productId: productId, // Asegurarse de que la variante pertenezca al producto
            },
            data: data.variant.data,
          });
        } else if (data.variant && data.variant.id) {
          // Si no hay datos para actualizar pero sí un ID, obtener la variante actual
          updatedVariant = await tx.productVariant.findUnique({
            where: { id: data.variant.id },
          });
        }

        // Devolver el resultado completo
        return {
          product: updatedProduct,
          variant: updatedVariant,
        };
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // Manejar errores específicos de Prisma
        if (error.code === "P2025") {
          throw {
            status: 404,
            message: "Producto o variante no encontrado",
            error: "NotFound",
          };
        }
        if (error.code === "P2002") {
          throw {
            status: 409,
            message: "Conflicto con datos existentes (clave única)",
            error: "UniqueConstraintViolation",
          };
        }
      }
      throw error;
    }
  }

  async deleteProduct(id: number) {
    try {
      const product = await prisma.product.delete({
        where: { id },
      });
      return product;
    } catch (error: any) {
      throw error;
    }
  }

  async searchProductVariants(searchTerm: string) {
    try {
      const variants = await prisma.productVariant.findMany({
        where: {
          product: {
            OR: [
              {
                name: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
              {
                barcode: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            ],
          },
        },
        include: {
          product: {
            include: {
              unitOfMeasure: true,
              productCategories: {
                include: {
                  category: true,
                },
              },
            },
          },
        },
        take: 20,
      });
      return variants;
    } catch (error: any) {
      throw error;
    }
  }

  async getProduct(id: number) {
    try {
      const product = await prisma.product.findUnique({
        where: { id },
      });
      return product;
    } catch (error: any) {
      throw error;
    }
  }

  //CATALOG
  async getAllPackagingType() {
    try {
      return await prisma.packagingType.findMany();
    } catch (error) {
      throw error;
    }
  }

  async getAllCategories() {
    try {
      return await prisma.category.findMany();
    } catch (error) {
      throw error;
    }
  }
}
