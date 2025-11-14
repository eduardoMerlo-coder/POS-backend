import { Request, Response } from "express";
import { ProductService } from "./services/product.service";
import { HttpResponse } from "@/shared/response/http.response";
import {
  CreateBaseProductDto,
  CreateProductVariantDto,
} from "./product.schema";

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
    try {
      const products = await this.productService.getAllBaseProducts();
      HttpResponse.Ok(res, products);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };

  public getProductsByUser = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    try {
      const products = await this.productService.getProductsByUser(userId);
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

  // CATALOG

  public getAllPackagingType = async (req: Request, res: Response) => {
    try {
      const packagingTypes = await this.productService.getAllPackagingType();
      HttpResponse.Ok(res, packagingTypes);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };
  public getAllCategories = async (req: Request, res: Response) => {
    try {
      const categories = await this.productService.getAllCategories();
      HttpResponse.Ok(res, categories);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };
}
