
import {
  CreateProductVariantDto,
  CreateBaseProductDto,
} from "../product.schema";
import { CreateBrandDto } from "../catalog.schema";
import { supabase } from "@/lib/supabase";

export class ProductService {
  async createBaseProduct(data: CreateBaseProductDto) {
    try {
      const {
        barcode,
        internal_code = "",
        name,
        brand_id,
        packaging_type_id,
        capacity,
        unit_id,
        categories,
        business_types,
      } = data;


      const existingProduct = await supabase.from("product").select("id").eq("barcode", barcode).eq("internal_code", internal_code).maybeSingle()
      if (existingProduct) {
        throw {
          status: 409,
          message: `Ya existe un producto con el mismo código de barras en este tipo de negocio.`,
        };
      }

      console.log(existingProduct)

      const { data: newProduct, error } = await supabase.rpc("create_base_product", {
        barcode,
        internal_code,
        name,
        brand_id,
        packaging_type_id,
        capacity,
        unit_id,
        categories,
        business_types,
      })
      console.log(newProduct, error)
      return newProduct
    } catch (error) {

      throw error;
    }
  }

  async createProductVariant(data: CreateProductVariantDto) {
    try {
      return data
    } catch (error) {
      throw error;
    }
  }
  async getProductsByUser(userId: number) {
    try {
      return userId;
    } catch (error) {
      throw error;
    }
  }

  async getAllBaseProducts(page: number, per_page: number, search_term?: string) {
    try {
      const { data, error, count } = await supabase
        .from("product")
        .select("*, unit:unit_id(name),brand:brand_id(name)", { count: "exact" })
        .range((page - 1) * per_page, page * per_page - 1)
        .or(
          `name.ilike.%${search_term ?? ''}%,barcode.ilike.%${search_term ?? ''}%,internal_code.ilike.%${search_term ?? ''}%`
        );
      if (error) throw error;
      return { products: data, total: count };
    } catch (error: any) {
      throw error;
    }
  }

  /**======================= OLD END POINTS ========================*/
  async updateProduct(id: number, data: any) {
    try {
      return id;
    } catch (error: any) {
      throw error;
    }
  }

  async updateProductWithVariant(
    productId: number,
    data: any
  ) {
    try {
      return productId;
    } catch (error) {
      throw error;
    }
  }

  async deleteProduct(id: number) {
    try {
      return id;
    } catch (error: any) {
      throw error;
    }
  }

  async searchProductVariants(searchTerm: string) {
    try {

      return searchTerm;
    } catch (error: any) {
      throw error;
    }
  }

  async getBaseProduct(id: number) {
    const { data, error } = await supabase.from("product").select("*").eq("id", id);
    if (error) throw error;
    return data;
  }

  //CATALOG
  async getAllPackagingType() {
    const { data, error } = await supabase.from("packaging_type").select("*");
    if (error) throw error;
    return data;
  }

  async getAllCategories() {
    const { data, error } = await supabase.from("category").select("*");
    if (error) throw error;
    return data;
  }
  async getBrands() {
    const { data, error } = await supabase.from("brand").select("*");
    if (error) throw error;
    return data;
  }
  async createBrand({ name }: CreateBrandDto) {
    const { data, error } = await supabase.from("brand").insert({ name });
    if (error) throw error;
    return data;
  }
}
