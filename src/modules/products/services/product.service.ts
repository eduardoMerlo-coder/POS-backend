
import {
  CreateProductVariantDto,
  CreateBaseProductDto,
} from "../product.schema";
import { CreateBrandDto } from "../catalog.schema";
import { supabase } from "@/lib/supabase";

export class ProductService {
  async createBaseProduct(data: CreateBaseProductDto) {
    const { data: newProduct, error } = await supabase.rpc('create_base_product', data)
    if (error) throw error;
    return newProduct
  }

  async createProductVariant(data: CreateProductVariantDto) {
    const { data: newProduct, error } = await supabase.rpc('create_product_with_variant', {
      e_barcode: data.barcode,
      e_internal_code: data.internal_code,
      e_name: data.name,
      e_brand_id: data.brand_id,
      e_packaging_type_id: data.packaging_type_id,
      e_capacity: data.capacity,
      e_unit_id: data.unit_id,
      e_categories: data.categories,
      e_business_types: data.business_types,
      e_quantity_per_package: data.quantity_per_package,
      e_user_id: data.user_id,
      e_price: data.price,
      e_stock_quantity: data.stock_quantity,
      e_min_stock: data.min_stock,
      e_status: data.status
    })
    if (error) throw error;
    return newProduct
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

  async getBaseProductById(id: number) {
    const { data, error } = await supabase.from("product").select("*").eq("id", id).single();
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
    const { data, error } = await supabase.from("brand").insert({ name }).select("*").single();
    if (error) throw error;
    return data;
  }
}
