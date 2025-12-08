import {
  CreateProductVariantDto,
  CreateBaseProductDto,
  CreateUserProductVariantDto,
  CreateProductVariantWithUserDto,
  UpdateUserProductVariantPriceDto,
} from "../product.schema";
import { CreateBrandDto } from "../catalog.schema";
import { supabase } from "@/lib/supabase";

export class ProductService {
  async createBaseProduct(data: CreateBaseProductDto) {
    // Crear el producto base
    const { data: newProduct, error: productError } = await supabase
      .from("product")
      .insert({
        name: data.name,
        brand_id: data.brand_id,
      })
      .select("*")
      .single();

    if (productError) throw productError;

    // Si hay categorías, crear las relaciones
    if (data.categories && data.categories.length > 0) {
      const categoryRelations = data.categories.map((categoryId) => ({
        product_id: newProduct.id,
        category_id: categoryId,
      }));

      const { error: categoryError } = await supabase
        .from("product_category")
        .insert(categoryRelations);

      if (categoryError) throw categoryError;
    }

    // Obtener el producto completo con sus relaciones
    const { data: productWithRelations, error: fetchError } = await supabase
      .from("product")
      .select(
        `
        *,
        brand:brand_id(id, name),
        product_category(
          category:category_id(id, name, description)
        )
      `
      )
      .eq("id", newProduct.id)
      .single();

    if (fetchError) throw fetchError;

    // Transformar los datos al formato esperado
    const categories =
      productWithRelations.product_category?.map((pc: any) => pc.category) ||
      [];

    return {
      id: productWithRelations.id,
      name: productWithRelations.name,
      brand_id: productWithRelations.brand_id,
      brand: productWithRelations.brand,
      categories: categories,
      barcode: productWithRelations.barcode,
    };
  }

  async createProductVariant(data: CreateProductVariantDto) {
    const { data: newProduct, error } = await supabase.rpc(
      "create_product_with_variant",
      {
        e_name: data.name,
        e_brand_id: data.brand_id,
        e_categories: data.categories,
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
  async getUserProducts(
    page: number,
    per_page: number,
    user_id: string,
    search_term?: string,
    sort: string = "name",
    order: string = "asc"
  ) {
    try {
      // Obtener todos los user_product_variant del usuario con sus relaciones
      const { data, error, count } = await supabase
        .from("user_product_variant")
        .select(
          `
          *,
          variant:variant_id(
            id,
            name,
            status,
            barcode,
            capacity,
            units,
            uom:uom_id(
              id,
              name,
              description
            ),
            product:product_id(
              id,
              name,
              brand:brand_id(
                id,
                name
              )
            )
          )
        `,
          { count: "exact" }
        )
        .eq("user_id", user_id);

      if (error) throw error;

      // Transformar los datos al formato esperado
      let transformedProducts =
        data?.map((upv: any) => {
          const variant = upv.variant;
          const product = variant?.product;
          return {
            id: variant?.id,
            variant_id: upv.variant_id,
            name: product?.name || "", // Nombre del producto base
            price: String(upv.price),
            capacity: variant?.capacity || null,
            unit: variant?.uom?.name || "", // Solo el nombre de la unidad
            brand: product?.brand?.name || "", // Nombre de la marca
            barcode: variant?.barcode || null,
            status: variant?.status || "ACTIVE",
          };
        }) || [];

      // Aplicar búsqueda si existe search_term
      if (search_term) {
        const searchLower = search_term.toLowerCase();
        transformedProducts = transformedProducts.filter((product: any) => {
          return (
            product.name?.toLowerCase().includes(searchLower) ||
            product.barcode?.toLowerCase().includes(searchLower) ||
            product.brand?.toLowerCase().includes(searchLower)
          );
        });
      }

      // Aplicar ordenamiento
      // Primero ordenar por precio 0 (los productos con precio 0 van primero)
      // Luego aplicar el ordenamiento normal según el criterio seleccionado
      const orderDirection = order.toLowerCase() === "desc" ? "desc" : "asc";
      transformedProducts.sort((a: any, b: any) => {
        // Priorizar productos con precio 0
        const aPriceIsZero = parseFloat(a.price) === 0;
        const bPriceIsZero = parseFloat(b.price) === 0;

        // Si uno tiene precio 0 y el otro no, el de precio 0 va primero
        if (aPriceIsZero && !bPriceIsZero) return -1;
        if (!aPriceIsZero && bPriceIsZero) return 1;

        // Si ambos tienen precio 0 o ambos no tienen precio 0, aplicar ordenamiento normal
        let aVal: any;
        let bVal: any;

        if (sort === "name") {
          aVal = a.name || "";
          bVal = b.name || "";
        } else if (sort === "price") {
          aVal = parseFloat(a.price) || 0;
          bVal = parseFloat(b.price) || 0;
        } else {
          aVal = a[sort] || "";
          bVal = b[sort] || "";
        }

        if (orderDirection === "asc") {
          if (typeof aVal === "string") {
            return aVal.localeCompare(bVal);
          }
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
          if (typeof aVal === "string") {
            return bVal.localeCompare(aVal);
          }
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
      });

      // Guardar el total antes de paginar
      const total = transformedProducts.length;

      // Aplicar paginación
      const paginatedProducts = transformedProducts.slice(
        (page - 1) * per_page,
        page * per_page
      );

      return {
        products: paginatedProducts,
        total: total,
      };
    } catch (error: any) {
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

  async createUserProductVariant(data: CreateUserProductVariantDto) {
    // Insertar en user_product_variant
    const { data: userProductVariant, error } = await supabase
      .from("user_product_variant")
      .insert({
        user_id: data.user_id,
        variant_id: data.variant_id,
        price: data.price,
        stock_quantity: data.stock_quantity,
        min_stock: data.min_stock,
      })
      .select("*")
      .single();

    if (error) throw error;
    return userProductVariant;
  }

  async updateUserProductVariantPrice(
    variantId: number,
    data: UpdateUserProductVariantPriceDto
  ) {
    // Actualizar el precio en user_product_variant
    const { data: updatedProductVariant, error } = await supabase
      .from("user_product_variant")
      .update({
        price: data.price,
      })
      .eq("variant_id", variantId)
      .eq("user_id", data.user_id)
      .select("*")
      .single();

    if (error) throw error;
    if (!updatedProductVariant) {
      throw new Error(
        "No se encontró el producto para actualizar. Verifica que el variant_id y user_id sean correctos."
      );
    }
    return updatedProductVariant;
  }

  async createProductVariantWithUser(data: CreateProductVariantWithUserDto) {
    // Usar función RPC de Supabase para garantizar atomicidad
    const { data: result, error } = await supabase.rpc(
      "create_product_variant_with_user",
      {
        p_product_base_id: data.product_base_id,
        p_presentation: data.presentation,
        p_capacity: data.capacity,
        p_unit_id: data.unit_id,
        p_quantity_per_package: data.quantity_per_package,
        p_price: data.price,
        p_stock_quantity: data.stock_quantity,
        p_min_stock: data.min_stock,
        p_user_id: data.user_id,
        p_barcode: data.barcode,
      }
    );

    if (error) throw error;
    return result;
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
