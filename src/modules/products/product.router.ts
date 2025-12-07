import { ProductController } from "./product.controller";
import { BaseRouter } from "@/shared/router";
import {
  createBaseProductSchema,
  createProductVariantSchema,
  createUserProductVariantSchema,
  createProductVariantWithUserSchema,
} from "./product.schema";
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
    // CATALOG ENDPOINTS

    this.router.get("/category", (req, res) =>
      this.controller.getAllCategories(req, res)
    );
    this.router.get("/brand", (req, res) =>
      this.controller.getBrands(req, res)
    );
    this.router.post("/brand", (req, res) =>
      this.controller.createBrand(req, res)
    );
  }
}
