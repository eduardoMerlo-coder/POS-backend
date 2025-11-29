
import {
  CreateProductVariantDto,
  CreateBaseProductDto,
} from "../product.schema";
import { CreateBrandDto } from "../catalog.schema";
import { supabase } from "@/lib/supabase";

export class ProductService {
  async createBaseProduct(data: CreateBaseProductDto) {
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
      quantityPerPackage,
    } = data;


    const existingProduct = await supabase.from("product").select("id").eq("barcode", barcode).eq("internal_code", internal_code).maybeSingle()
    if (existingProduct.data) {
      throw {
        status: 409,
        message: `Ya existe un producto con el mismo código de barras.`,
      };
    }
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
      quantityPerPackage
    })
    if (error) throw error;
    return newProduct
  }

  async createProductVariant(data: CreateProductVariantDto) {
    let newProduct;
    const existingProduct = await supabase.from("product").select("id").eq("barcode", data.barcode).eq("internal_code", data.internal_code).maybeSingle()
    if (!existingProduct.data) {
      const newBaseProduct = await this.createBaseProduct({
        barcode: data.barcode,
        internal_code: data.internal_code,
        name: data.name,
        brand_id: data.brand_id,
        packaging_type_id: data.packaging_type_id,
        capacity: data.capacity,
        unit_id: data.unit_id,
        categories: data.categories,
        business_types: data.business_types,
        quantityPerPackage: data.quantityPerPackage,
      })
      newProduct = newBaseProduct.data
    } else {
      newProduct = existingProduct.data
    }
    const { data: newVariant, error } = await supabase.from("product_variant").insert({
      product_id: newProduct.id,
      status: data.status
    }).select("*").single()
    if (error) throw error;

    const { error: userProductVariantError } = await supabase.from("user_product_variant").insert({
      user_id: data.userId,
      variant_id: newVariant.id,
      price: data.price,
      stock_quantity: data.stock_quantity,
      min_stock: data.min_stock,
    }).select("*").single()
    if (userProductVariantError) throw userProductVariantError;
    return newVariant
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
