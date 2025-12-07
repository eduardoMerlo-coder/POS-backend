import { Request, Response } from "express";
import { ProductService } from "./services/product.service";
import { HttpResponse } from "@/shared/response/http.response";
import {
  CreateBaseProductDto,
  CreateProductVariantDto,
  CreateUserProductVariantDto,
  CreateProductVariantWithUserDto,
} from "./product.schema";
import { CreateBrandDto } from "./catalog.schema";

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
        searchTerm,
        sort,
        order,
        user_id
      );
      HttpResponse.Ok(res, products);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };

  public getProductById = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    try {
      HttpResponse.Ok(res, {});
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };
  public searchProducts = async (req: Request, res: Response) => {
    const searchTerm = req.query.searchTerm as string;
    const page = parseInt(req.query.page as string) || 1;
    const perPage = parseInt(req.query.perPage as string) || 20;
    try {
      HttpResponse.Ok(res, {});
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };

  public updateProduct = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    try {
      const product = await this.productService.updateProduct(id, req.body);
      HttpResponse.Ok(res, product);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };

  public updateProductWithVariant = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    try {
      const product = await this.productService.updateProductWithVariant(
        id,
        req.body
      );
      HttpResponse.Ok(res, product);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };

  public deleteProduct = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    try {
      const product = await this.productService.deleteProduct(id);
      HttpResponse.Ok(res, product);
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

  public getVariantsByProductId = async (req: Request, res: Response) => {
    const productId = parseInt(req.params.id);
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

  // CATALOG

  public getAllCategories = async (req: Request, res: Response) => {
    try {
      const categories = await this.productService.getAllCategories();
      HttpResponse.Ok(res, categories);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };
  public getBrands = async (req: Request, res: Response) => {
    try {
      const brands = await this.productService.getBrands();
      HttpResponse.Ok(res, brands);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };
  public createBrand = async (req: Request, res: Response) => {
    const { name } = req.body as CreateBrandDto;
    try {
      const newBrand = await this.productService.createBrand({
        name,
      });
      HttpResponse.Ok(res, newBrand);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };
}
