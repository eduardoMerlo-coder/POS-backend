import {
  CreateProductVariantDto,
  CreateBaseProductDto,
} from "../product.schema";
import { CreateBrandDto } from "../catalog.schema";
import { supabase } from "@/lib/supabase";

export class ProductService {
  async createBaseProduct(data: CreateBaseProductDto) {
    const { data: newProduct, error } = await supabase.rpc(
      "create_base_product",
      data
    );
    if (error) throw error;
    return newProduct;
  }

  async createProductVariant(data: CreateProductVariantDto) {
    const { data: newProduct, error } = await supabase.rpc(
      "create_product_with_variant",
      {
        e_barcode: data.barcode,
        e_internal_code: data.internal_code,
        e_name: data.name,
        e_brand_id: data.brand_id,
        e_capacity: data.capacity,
        e_unit_id: data.unit_id,
        e_categories: data.categories,
        e_business_types: data.business_types,
        e_quantity_per_package: data.quantity_per_package,
        e_user_id: data.user_id,
        e_price: data.price,
        e_stock_quantity: data.stock_quantity,
        e_min_stock: data.min_stock,
        e_status: data.status,
      }
    );
    if (error) throw error;
    return newProduct;
  }
  async getProductsByUser(userId: number) {
    try {
      return userId;
    } catch (error) {
      throw error;
    }
  }

  async getAllBaseProducts(
    page: number,
    per_page: number,
    search_term?: string,
    sort: string = "name",
    order: string = "asc"
  ) {
    try {
      let query = supabase.from("product").select(
        `
          *,
          brand:brand_id(id, name),
          product_category(
            category:category_id(id, name, description)
          ),
          product_business_type(business_type_id)
        `,
        { count: "exact" }
      );

      // Aplicar búsqueda si existe search_term
      if (search_term) {
        // Primero buscar marcas que coincidan con el término de búsqueda
        const { data: matchingBrands } = await supabase
          .from("brand")
          .select("id")
          .ilike("name", `%${search_term}%`);

        const brandIds = matchingBrands?.map((b) => b.id) || [];

        // Si hay marcas que coinciden, hacer dos consultas y combinar resultados
        if (brandIds.length > 0) {
          // Consulta 1: productos donde name o barcode coinciden
          const query1 = supabase
            .from("product")
            .select(
              `
              *,
              brand:brand_id(id, name),
              product_category(
                category:category_id(id, name, description)
              ),
              product_business_type(business_type_id)
            `,
              { count: "exact" }
            )
            .or(`name.ilike.%${search_term}%,barcode.ilike.%${search_term}%`);

          // Consulta 2: productos donde brand_id está en las marcas que coinciden
          const query2 = supabase
            .from("product")
            .select(
              `
              *,
              brand:brand_id(id, name),
              product_category(
                category:category_id(id, name, description)
              ),
              product_business_type(business_type_id)
            `
            )
            .in("brand_id", brandIds);

          // Ejecutar ambas consultas
          const [result1, result2] = await Promise.all([query1, query2]);

          if (result1.error) throw result1.error;
          if (result2.error) throw result2.error;

          // Combinar resultados y eliminar duplicados
          const combinedData = [
            ...(result1.data || []),
            ...(result2.data || []),
          ];
          const uniqueProducts = Array.from(
            new Map(combinedData.map((p) => [p.id, p])).values()
          );

          // Aplicar ordenamiento a los resultados combinados
          const orderDirection =
            order.toLowerCase() === "desc" ? "desc" : "asc";
          uniqueProducts.sort((a, b) => {
            const aVal = a[sort];
            const bVal = b[sort];
            if (orderDirection === "asc") {
              return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
              return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
          });

          // Aplicar paginación
          const paginatedData = uniqueProducts.slice(
            (page - 1) * per_page,
            page * per_page
          );

          // Transformar los datos al formato esperado
          const transformedProducts = paginatedData.map((product: any) => {
            const categories =
              product.product_category?.map((pc: any) => pc.category) || [];
            const business_types =
              product.product_business_type?.map(
                (pbt: any) => pbt.business_type_id
              ) || [];

            return {
              id: product.id,
              name: product.name,
              brand_id: product.brand_id,
              brand: product.brand,
              categories: categories,
              business_types: business_types,
              barcode: product.barcode,
            };
          });

          return {
            products: transformedProducts,
            total: uniqueProducts.length,
          };
        } else {
          // Si no hay marcas que coinciden, solo buscar en name y barcode
          query = query.or(
            `name.ilike.%${search_term}%,barcode.ilike.%${search_term}%`
          );
        }
      }

      // Aplicar ordenamiento
      const orderDirection = order.toLowerCase() === "desc" ? "desc" : "asc";
      query = query.order(sort, { ascending: orderDirection === "asc" });

      // Aplicar paginación
      const { data, error, count } = await query.range(
        (page - 1) * per_page,
        page * per_page - 1
      );

      if (error) throw error;

      // Transformar los datos al formato esperado
      const transformedProducts = data?.map((product: any) => {
        // Extraer categories del formato product_category
        const categories =
          product.product_category?.map((pc: any) => pc.category) || [];

        // Extraer business_types como array de IDs
        const business_types =
          product.product_business_type?.map(
            (pbt: any) => pbt.business_type_id
          ) || [];

        return {
          id: product.id,
          name: product.name,
          brand_id: product.brand_id,
          brand: product.brand,
          categories: categories,
          business_types: business_types,
          barcode: product.barcode,
        };
      });

      return { products: transformedProducts, total: count };
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

  async updateProductWithVariant(productId: number, data: any) {
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
    const { data, error } = await supabase
      .from("product")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  }

  async getVariantsByProductId(productId: number) {
    const { data, error } = await supabase
      .from("product_variant")
      .select(
        `
        *,
        uom:uom_id(id, name, description)
      `
      )
      .eq("product_id", productId);

    if (error) throw error;

    // Transformar los datos al formato esperado
    const transformedVariants = data?.map((variant: any) => ({
      id: variant.id,
      product_id: variant.product_id,
      name: variant.name,
      status: variant.status,
      barcode: variant.barcode,
      units: variant.units,
      capacity: variant.capacity,
      uom_id: variant.uom_id,
      uom: variant.uom,
    }));

    return transformedVariants || [];
  }

  //CATALOG
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
    const { data, error } = await supabase
      .from("brand")
      .insert({ name })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  }
}
