import { ProductController } from "./product.controller";
import { BaseRouter } from "@/shared/router";
import {
  createBaseProductSchema,
  createUserProductVariantSchema,
  createProductVariantWithUserSchema,
  updateBaseProductSchema,
  updateUserProductVariantSchema,
  updateProductVariantSchema,
} from "./product.schema";
import {
  createBrandSchema,
  updateBrandSchema,
  createCategorySchema,
  updateCategorySchema,
} from "./catalog.schema";
import { validateSchema } from "@/shared/middleware/base";

export class ProductRouter extends BaseRouter<ProductController> {
  constructor() {
    super(ProductController);
  }
  public routes() {
    this.router.get("/base-products", (req, res) =>
      this.controller.getBaseProducts(req, res)
    );
    this.router.get("/user-products", (req, res) =>
      this.controller.getUserProducts(req, res)
    );
    this.router.get("/product-base/:id", (req, res) =>
      this.controller.getBaseProductById(req, res)
    );
    this.router.get("/product-base/:id/variants", (req, res) =>
      this.controller.getVariantsByProductId(req, res)
    );
    this.router.post(
      "/product-base",
      validateSchema(createBaseProductSchema),
      (req, res) => this.controller.createBaseProduct(req, res)
    );
    this.router.put(
      "/product-base/:id",
      validateSchema(updateBaseProductSchema),
      (req, res) => this.controller.updateBaseProduct(req, res)
    );
    this.router.post(
      "/product-variant",
      validateSchema(createProductVariantWithUserSchema),
      (req, res) => this.controller.createProductVariantWithUser(req, res)
    );
    this.router.post(
      "/user-product-variant",
      validateSchema(createUserProductVariantSchema),
      (req, res) => this.controller.createUserProductVariant(req, res)
    );
    this.router.put(
      "/user-product-variant/:id",
      validateSchema(updateUserProductVariantSchema),
      (req, res) => this.controller.updateUserProductVariant(req, res)
    );
    this.router.put(
      "/product-variant/:id",
      validateSchema(updateProductVariantSchema),
      (req, res) => this.controller.updateProductVariant(req, res)
    );
    this.router.get("/user-product-variant/:id", (req, res) =>
      this.controller.getUserProductVariantById(req, res)
    );
    this.router.get("/product/:id", (req, res) =>
      this.controller.getProductById(req, res)
    );
    this.router.get("/search", (req, res) =>
      this.controller.searchProducts(req, res)
    );
    this.router.put("/product/:id", (req, res) =>
      this.controller.updateProductWithVariant(req, res)
    );
    this.router.delete("/product/:id", (req, res) =>
      this.controller.deleteProduct(req, res)
    );
    // CATALOG ENDPOINTS - Categories

    this.router.get("/category", (req, res) =>
      this.controller.getAllCategories(req, res)
    );
    this.router.get("/category/:id", (req, res) =>
      this.controller.getCategoryById(req, res)
    );
    this.router.post(
      "/category",
      validateSchema(createCategorySchema),
      (req, res) => this.controller.createCategory(req, res)
    );
    this.router.put(
      "/category/:id",
      validateSchema(updateCategorySchema),
      (req, res) => this.controller.updateCategory(req, res)
    );

    // CATALOG ENDPOINTS - Brands

    this.router.get("/brand", (req, res) =>
      this.controller.getBrands(req, res)
    );
    this.router.get("/brand/:id", (req, res) =>
      this.controller.getBrandById(req, res)
    );
    this.router.post("/brand", validateSchema(createBrandSchema), (req, res) =>
      this.controller.createBrand(req, res)
    );
    this.router.put(
      "/brand/:id",
      validateSchema(updateBrandSchema),
      (req, res) => this.controller.updateBrand(req, res)
    );
  }
}
