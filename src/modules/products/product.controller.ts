import { Request, Response } from "express";
import { ProductService } from "./services/product.service";
import { HttpResponse } from "@/shared/response/http.response";
import {
  CreateBaseProductDto,
  CreateProductVariantDto,
  CreateUserProductVariantDto,
  CreateProductVariantWithUserDto,
  UpdateBaseProductDto,
  UpdateUserProductVariantDto,
  UpdateProductVariantDto,
} from "./product.schema";
import {
  CreateBrandDto,
  UpdateBrandDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "./catalog.schema";

export class ProductController {
  constructor(
    private readonly productService: ProductService = new ProductService()
  ) {}

  public createBaseProduct = async (req: Request, res: Response) => {
    const productData = req.body as CreateBaseProductDto;
    try {
      const products = await this.productService.createBaseProduct(productData);
      HttpResponse.Ok(res, products);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };

  public createProductVariant = async (req: Request, res: Response) => {
    const productData = req.body as CreateProductVariantDto;
    try {
      const products = await this.productService.createProductVariant(
        productData
      );
      HttpResponse.Ok(res, products);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };
  public getBaseProducts = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const per_page = parseInt(req.query.per_page as string) || 20;
    const searchTerm = req.query.searchTerm as string;
    const sort = (req.query.sort as string) || "name";
    const order = (req.query.order as string) || "asc";
    try {
      const products = await this.productService.getAllBaseProducts(
        page,
        per_page,
        searchTerm,
        sort,
        order
      );
      HttpResponse.Ok(res, products);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };

  public getUserProducts = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const per_page = parseInt(req.query.per_page as string) || 20;
    const searchTerm = req.query.searchTerm as string;
    const sort = (req.query.sort as string) || "name";
    const order = (req.query.order as string) || "asc";
    const user_id = req.query.user_id as string;

    if (!user_id) {
      return HttpResponse.BadRequest(res, { message: "user_id es requerido" });
    }

    try {
      const products = await this.productService.getUserProducts(
        page,
        per_page,
        user_id,
        searchTerm,
        sort,
        order
      );
      HttpResponse.Ok(res, products);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };

  public getProductById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (!id || isNaN(id)) {
      return HttpResponse.BadRequest(res, {
        message: "id debe ser un número válido",
      });
    }

    try {
      const product = await this.productService.getBaseProductById(id);
      HttpResponse.Ok(res, product);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };

  public searchProducts = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const per_page = parseInt(req.query.per_page as string) || 20;
    const searchTerm = req.query.searchTerm as string;
    const sort = (req.query.sort as string) || "name";
    const order = (req.query.order as string) || "asc";

    try {
      const products = await this.productService.getAllBaseProducts(
        page,
        per_page,
        searchTerm,
        sort,
        order
      );
      HttpResponse.Ok(res, products);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };

  public getBaseProductById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    try {
      const product = await this.productService.getBaseProductById(id);
      HttpResponse.Ok(res, product);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };

  public updateBaseProduct = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data = req.body as UpdateBaseProductDto;

    if (!id || isNaN(id)) {
      return HttpResponse.BadRequest(res, {
        message: "id debe ser un número válido",
      });
    }

    try {
      const product = await this.productService.updateBaseProduct(id, data);
      HttpResponse.Ok(res, product);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };

  public getVariantsByProductId = async (req: Request, res: Response) => {
    const productId = parseInt(req.params.id);

    if (!productId || isNaN(productId)) {
      return HttpResponse.BadRequest(res, {
        message: "id debe ser un número válido",
      });
    }

    try {
      const variants = await this.productService.getVariantsByProductId(
        productId
      );
      HttpResponse.Ok(res, variants);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };

  public createUserProductVariant = async (req: Request, res: Response) => {
    const data = req.body as CreateUserProductVariantDto;
    try {
      const result = await this.productService.createUserProductVariant(data);
      HttpResponse.Ok(res, result);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };

  public createProductVariantWithUser = async (req: Request, res: Response) => {
    const data = req.body as CreateProductVariantWithUserDto;
    try {
      const result = await this.productService.createProductVariantWithUser(
        data
      );
      HttpResponse.Ok(res, result);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };

  public updateUserProductVariant = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data = req.body as UpdateUserProductVariantDto;

    if (!id || isNaN(id)) {
      return HttpResponse.BadRequest(res, {
        message: "id debe ser un número válido",
      });
    }

    try {
      const result = await this.productService.updateUserProductVariant(
        id,
        data
      );
      HttpResponse.Ok(res, result);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };

  public getUserProductVariantById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (!id || isNaN(id)) {
      return HttpResponse.BadRequest(res, {
        message: "id debe ser un número válido",
      });
    }

    try {
      const result = await this.productService.getUserProductVariantById(id);
      HttpResponse.Ok(res, result);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };

  public updateProductVariant = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data = req.body as UpdateProductVariantDto;

    if (!id || isNaN(id)) {
      return HttpResponse.BadRequest(res, {
        message: "id debe ser un número válido",
      });
    }

    try {
      const result = await this.productService.updateProductVariant(id, data);
      HttpResponse.Ok(res, result);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };

  // CATALOG - Categories

  public getAllCategories = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const per_page = parseInt(req.query.per_page as string) || 20;
    const user_id = req.query.user_id as string;
    const searchTerm = req.query.searchTerm as string;
    const sort = (req.query.sort as string) || "name";
    const order = (req.query.order as string) || "asc";

    if (!user_id) {
      return HttpResponse.BadRequest(res, { message: "user_id es requerido" });
    }

    try {
      const result = await this.productService.getAllCategories(
        page,
        per_page,
        user_id,
        searchTerm,
        sort,
        order
      );
      HttpResponse.Ok(res, result);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };

  public getCategoryById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (!id || isNaN(id)) {
      return HttpResponse.BadRequest(res, {
        message: "id debe ser un número válido",
      });
    }

    try {
      const category = await this.productService.getCategoryById(id);
      HttpResponse.Ok(res, category);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };

  public createCategory = async (req: Request, res: Response) => {
    const data = req.body as CreateCategoryDto;
    try {
      const newCategory = await this.productService.createCategory(data);
      HttpResponse.Ok(res, newCategory);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };

  public updateCategory = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data = req.body as UpdateCategoryDto;

    if (!id || isNaN(id)) {
      return HttpResponse.BadRequest(res, {
        message: "id debe ser un número válido",
      });
    }

    try {
      const category = await this.productService.updateCategory(id, data);
      HttpResponse.Ok(res, category);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };

  // CATALOG - Brands

  public getBrands = async (req: Request, res: Response) => {
    const user_id = req.query.user_id as string;

    if (!user_id) {
      return HttpResponse.BadRequest(res, { message: "user_id es requerido" });
    }

    try {
      const brands = await this.productService.getBrands(user_id);
      HttpResponse.Ok(res, brands);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };

  public getBrandById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (!id || isNaN(id)) {
      return HttpResponse.BadRequest(res, {
        message: "id debe ser un número válido",
      });
    }

    try {
      const brand = await this.productService.getBrandById(id);
      HttpResponse.Ok(res, brand);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };

  public createBrand = async (req: Request, res: Response) => {
    const data = req.body as CreateBrandDto;
    try {
      const newBrand = await this.productService.createBrand(data);
      HttpResponse.Ok(res, newBrand);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };

  public updateBrand = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const data = req.body as UpdateBrandDto;

    if (!id || isNaN(id)) {
      return HttpResponse.BadRequest(res, {
        message: "id debe ser un número válido",
      });
    }

    try {
      const brand = await this.productService.updateBrand(id, data);
      HttpResponse.Ok(res, brand);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };

  public checkUserProductVariantExists = async (
    req: Request,
    res: Response
  ) => {
    const variantId = parseInt(req.query.variant_id as string);
    const userId = req.query.user_id as string;

    if (!variantId || isNaN(variantId)) {
      return HttpResponse.BadRequest(res, {
        message: "variant_id debe ser un número válido",
      });
    }

    if (!userId) {
      return HttpResponse.BadRequest(res, {
        message: "user_id es requerido",
      });
    }

    try {
      const exists = await this.productService.checkUserProductVariantExists(
        variantId,
        userId
      );
      HttpResponse.Ok(res, { exists });
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };
}
