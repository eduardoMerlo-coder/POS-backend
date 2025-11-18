import { ProductController } from "./product.controller";
import { BaseRouter } from "@/shared/router";
import {
  createBaseProductSchema,
  createProductVariantSchema,
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
    this.router.get("/products-user", (req, res) =>
      this.controller.getProductsByUser(req, res)
    );
    this.router.post(
      "/product-base",
      validateSchema(createBaseProductSchema),
      (req, res) => this.controller.createBaseProduct(req, res)
    );
    this.router.post(
      "/product-variant",
      validateSchema(createProductVariantSchema),
      (req, res) => this.controller.createProductVariant(req, res)
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

    this.router.get("/packaging-type", (req, res) =>
      this.controller.getAllPackagingType(req, res)
    );
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
