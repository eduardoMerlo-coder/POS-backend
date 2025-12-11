import {
  CreateProductVariantDto,
  CreateBaseProductDto,
  CreateUserProductVariantDto,
  CreateProductVariantWithUserDto,
  UpdateBaseProductDto,
  UpdateUserProductVariantDto,
  UpdateProductVariantDto,
} from "../product.schema";
import {
  CreateBrandDto,
  UpdateBrandDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../catalog.schema";
import { supabase } from "@/lib/supabase";

/**
 * Escapes special characters in search terms for safe use in PostgREST filter strings.
 * Escapes LIKE pattern wildcards (% and _) and PostgREST filter syntax characters (commas, parentheses).
 */
function escapeSearchTerm(term: string): string {
  return term
    .replace(/\\/g, "\\\\") // Escape backslashes first
    .replace(/%/g, "\\%") // Escape LIKE wildcard %
    .replace(/_/g, "\\_") // Escape LIKE wildcard _
    .replace(/,/g, "\\,") // Escape commas that could break filter syntax
    .replace(/\(/g, "\\(") // Escape opening parentheses
    .replace(/\)/g, "\\)"); // Escape closing parentheses
}

export class ProductService {
  async createBaseProduct(data: CreateBaseProductDto) {
    // Usar función RPC para creación atómica del producto con categorías
    // Esto garantiza que si la inserción de categorías falla, la creación del producto se revierte
    const { data: result, error } = await supabase.rpc("create_base_product", {
      p_name: data.name,
      p_brand_id: data.brand_id,
      p_category_ids: data.categories || [],
    });

    if (error) throw error;

    // La función RPC ya retorna el producto con sus relaciones en el formato correcto
    return result;
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
    // Obtener todos los user_product_variant del usuario con sus relaciones
    const { data, error } = await supabase
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
          user_product_variant_id: upv.id,
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
        // Para otros campos, determinar el tipo basándose en ambos valores
        // para mantener consistencia de tipos
        const valA = a[sort];
        const valB = b[sort];
        
        // Si al menos uno es numérico (incluyendo 0), tratar ambos como números
        const isNumeric = 
          (typeof valA === "number" && !isNaN(valA)) ||
          (typeof valB === "number" && !isNaN(valB));
        
        if (isNumeric) {
          aVal = typeof valA === "number" ? valA : (valA ? Number(valA) : 0);
          bVal = typeof valB === "number" ? valB : (valB ? Number(valB) : 0);
          // Si la conversión falla, usar 0
          aVal = isNaN(aVal) ? 0 : aVal;
          bVal = isNaN(bVal) ? 0 : bVal;
        } else {
          // Si no son numéricos, tratar como strings
          aVal = valA != null ? String(valA) : "";
          bVal = valB != null ? String(valB) : "";
        }
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
        // Escapar el término de búsqueda para prevenir coincidencias de patrón no deseadas
        const escapedTerm = escapeSearchTerm(search_term);

        // Primero buscar marcas que coincidan con el término de búsqueda
        const { data: matchingBrands } = await supabase
          .from("brand")
          .select("id")
          .ilike("name", `%${escapedTerm}%`);

        const brandIds = matchingBrands?.map((b) => b.id) || [];

        // Si hay marcas que coinciden, hacer dos consultas y combinar resultados
        if (brandIds.length > 0) {
          // Consulta 1: productos donde name coincide
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
            .ilike("name", `%${escapedTerm}%`);

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
            // Manejar valores null/undefined con fallbacks apropiados
            let aVal: any;
            let bVal: any;

            if (sort === "name") {
              aVal = a.name || "";
              bVal = b.name || "";
            } else if (sort === "brand_id") {
              aVal = a.brand_id ?? 0;
              bVal = b.brand_id ?? 0;
            } else {
              // Para otros campos, determinar el tipo basándose en ambos valores
              // para mantener consistencia de tipos
              const valA = a[sort];
              const valB = b[sort];
              
              // Si al menos uno es numérico (incluyendo 0), tratar ambos como números
              const isNumeric = 
                (typeof valA === "number" && !isNaN(valA)) ||
                (typeof valB === "number" && !isNaN(valB));
              
              if (isNumeric) {
                aVal = typeof valA === "number" ? valA : (valA != null ? Number(valA) : 0);
                bVal = typeof valB === "number" ? valB : (valB != null ? Number(valB) : 0);
                // Si la conversión falla, usar 0
                aVal = isNaN(aVal) ? 0 : aVal;
                bVal = isNaN(bVal) ? 0 : bVal;
              } else {
                // Si no son numéricos, tratar como strings
                aVal = valA != null ? String(valA) : "";
                bVal = valB != null ? String(valB) : "";
              }
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
            };
          });

          return {
            products: transformedProducts,
            total: uniqueProducts.length,
          };
        } else {
          // Si no hay marcas que coinciden, solo buscar en name
          query = query.ilike("name", `%${escapedTerm}%`);
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
        };
      });

      return { products: transformedProducts, total: count };
    } catch (error: any) {
      throw error;
    }
  }

  async getBaseProductById(id: number) {
    const { data, error } = await supabase
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
      .eq("id", id)
      .single();
    if (error) throw error;

    // Transformar los datos al formato esperado
    const categories =
      data.product_category?.map((pc: any) => pc.category) || [];
    const business_types =
      data.product_business_type?.map((pbt: any) => pbt.business_type_id) ||
      [];

    return {
      id: data.id,
      name: data.name,
      brand_id: data.brand_id,
      brand: data.brand,
      categories: categories,
      business_types: business_types,
    };
  }

  async updateBaseProduct(id: number, data: UpdateBaseProductDto) {
    // Verificar que el producto existe
    const { data: existingProduct, error: checkError } = await supabase
      .from("product")
      .select("id")
      .eq("id", id)
      .single();

    if (checkError || !existingProduct) {
      throw new Error(`Producto con id ${id} no encontrado`);
    }

    // Preparar los datos para actualizar el producto
    const updateData: {
      name?: string;
      brand_id?: number;
      categories?: number[];
    } = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.brand_id !== undefined) {
      updateData.brand_id = data.brand_id;
    }

    // Actualizar el producto si hay campos para actualizar
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from("product")
        .update(updateData)
        .eq("id", id);

      if (updateError) throw updateError;
    }

    // Si hay categorías, actualizar las relaciones de forma atómica
    if (data.categories !== undefined) {
      // Usar función RPC para actualización atómica de categorías
      // Esto garantiza que si la inserción falla, la eliminación se revierte
      const { error: categoryUpdateError } = await supabase.rpc(
        "update_product_categories",
        {
          p_product_id: id,
          p_category_ids: data.categories,
        }
      );

      if (categoryUpdateError) throw categoryUpdateError;
    }

    // Obtener el producto actualizado con sus relaciones
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
      .eq("id", id)
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
    };
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

  async updateProductVariant(id: number, data: UpdateProductVariantDto) {
    // Verificar que el variant existe
    const { data: existingVariant, error: checkError } = await supabase
      .from("product_variant")
      .select("id")
      .eq("id", id)
      .single();

    if (checkError || !existingVariant) {
      throw new Error(`Product variant con id ${id} no encontrado`);
    }

    // Preparar los datos para actualizar el product_variant
    const updateData: {
      name?: string;
      capacity?: number;
      uom_id?: number;
      units?: number;
      barcode?: string;
    } = {};

    if (data.presentation !== undefined) {
      updateData.name = data.presentation;
    }

    if (data.capacity !== undefined) {
      updateData.capacity = data.capacity;
    }

    if (data.unit_id !== undefined) {
      updateData.uom_id = data.unit_id;
    }

    if (data.units !== undefined) {
      updateData.units = data.units;
    }

    if (data.barcode !== undefined) {
      updateData.barcode = data.barcode;
    }

    // Actualizar el product_variant si hay campos para actualizar
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from("product_variant")
        .update(updateData)
        .eq("id", id);

      if (updateError) throw updateError;
    }

    // Obtener el variant actualizado con sus relaciones
    const { data: updatedVariant, error: fetchError } = await supabase
      .from("product_variant")
      .select(
        `
        *,
        uom:uom_id(id, name, description)
      `
      )
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    return {
      id: updatedVariant.id,
      product_id: updatedVariant.product_id,
      name: updatedVariant.name,
      status: updatedVariant.status,
      barcode: updatedVariant.barcode,
      units: updatedVariant.units,
      capacity: updatedVariant.capacity,
      uom_id: updatedVariant.uom_id,
      uom: updatedVariant.uom,
    };
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

  async updateUserProductVariant(
    userProductVariantId: number,
    data: UpdateUserProductVariantDto
  ) {
    // Verificar que el user_product_variant existe
    const { data: existingUserProductVariant, error: checkError } =
      await supabase
        .from("user_product_variant")
        .select("id")
        .eq("id", userProductVariantId)
        .single();

    if (checkError || !existingUserProductVariant) {
      throw new Error(
        `User product variant con id ${userProductVariantId} no encontrado`
      );
    }

    // Preparar datos para actualizar user_product_variant
    const updateData: {
      price?: number;
      stock_quantity?: number;
      min_stock?: number;
    } = {};

    if (data.price !== undefined) {
      updateData.price = data.price;
    }

    if (data.stock_quantity !== undefined) {
      updateData.stock_quantity = data.stock_quantity;
    }

    if (data.min_stock !== undefined) {
      updateData.min_stock = data.min_stock;
    }

    // Actualizar user_product_variant si hay campos para actualizar
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from("user_product_variant")
        .update(updateData)
        .eq("id", userProductVariantId);

      if (updateError) throw updateError;
    }

    // Obtener el user_product_variant actualizado
    const { data: updatedUserProductVariant, error: fetchError } =
      await supabase
        .from("user_product_variant")
        .select("*")
        .eq("id", userProductVariantId)
        .single();

    if (fetchError) throw fetchError;

    return updatedUserProductVariant;
  }

  async getUserProductVariantById(userProductVariantId: number) {
    const { data, error } = await supabase
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
            product_id,
            uom_id,
            product:product_id(
              id,
              name,
              brand_id,
              product_category(
                category:category_id(
                  id,
                  name
                )
              ),
              product_business_type(
                business_type_id
              )
            )
          )
        `
      )
      .eq("id", userProductVariantId)
      .single();

    if (error) throw error;
    if (!data) {
      throw new Error("No se encontró el producto variant del usuario");
    }

    const upv = data;
    const variant = upv.variant;
    const product = variant?.product;

    // Extraer categorías como array de números (IDs), filtrando valores inválidos
    const categories =
      product?.product_category
        ?.map((pc: any) => pc.category?.id)
        .filter((id: any) => id !== undefined && id !== null && id !== "") || [];

    // Extraer business_types como array de números
    const business_types =
      product?.product_business_type?.map((pbt: any) => pbt.business_type_id) ||
      [];

    // Transformar al formato solicitado
    return {
      user_product_variant_id: upv.id || 0,
      name: product?.name || "",
      variant_id: variant?.id || undefined,
      product_id: product?.id || 0,
      barcode: variant?.barcode || "",
      brand_id: product?.brand_id || 0,
      capacity: variant?.capacity || 0,
      unit_id: String(variant?.uom_id || ""),
      categories: categories,
      business_types: business_types,
      units: variant?.units || 0,
      stock_quantity: upv.stock_quantity || 0,
      min_stock: upv.min_stock || 0,
      status: variant?.status || "ACTIVE",
      price: Number(upv.price) || 0,
      presentation: variant?.name || undefined,
    };
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
        p_quantity_per_package: data.units,
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

  //CATALOG - Categories
  async getAllCategories(
    page: number,
    per_page: number,
    search_term?: string,
    sort: string = "name",
    order: string = "asc"
  ) {
    let query = supabase.from("category").select("*", { count: "exact" });

    // Aplicar búsqueda si existe search_term
    if (search_term) {
      // Escapar el término de búsqueda para prevenir inyección de filtros
      const escapedTerm = escapeSearchTerm(search_term);
      query = query.or(
        `name.ilike.%${escapedTerm}%,description.ilike.%${escapedTerm}%`
      );
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

    return {
      categories: data || [],
      total: count || 0,
    };
  }

  async getCategoryById(id: number) {
    const { data, error } = await supabase
      .from("category")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  }

  async createCategory(data: CreateCategoryDto) {
    const { data: newCategory, error } = await supabase
      .from("category")
      .insert({
        name: data.name,
        description: data.description || null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return newCategory;
  }

  async updateCategory(id: number, data: UpdateCategoryDto) {
    // Verificar que la categoría existe
    const { data: existingCategory, error: checkError } = await supabase
      .from("category")
      .select("id")
      .eq("id", id)
      .single();

    if (checkError || !existingCategory) {
      throw new Error(`Categoría con id ${id} no encontrada`);
    }

    // Preparar los datos para actualizar
    const updateData: {
      name?: string;
      description?: string | null;
    } = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.description !== undefined) {
      updateData.description = data.description || null;
    }

    // Actualizar la categoría si hay campos para actualizar
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from("category")
        .update(updateData)
        .eq("id", id);

      if (updateError) throw updateError;
    }

    // Obtener la categoría actualizada
    const { data: updatedCategory, error: fetchError } = await supabase
      .from("category")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;
    return updatedCategory;
  }

  //CATALOG - Brands
  async getBrands() {
    const { data, error } = await supabase.from("brand").select("*");
    if (error) throw error;
    return data;
  }

  async getBrandById(id: number) {
    const { data, error } = await supabase
      .from("brand")
      .select("*")
      .eq("id", id)
      .single();
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

  async updateBrand(id: number, data: UpdateBrandDto) {
    // Verificar que la marca existe
    const { data: existingBrand, error: checkError } = await supabase
      .from("brand")
      .select("id")
      .eq("id", id)
      .single();

    if (checkError || !existingBrand) {
      throw new Error(`Marca con id ${id} no encontrada`);
    }

    // Preparar los datos para actualizar
    const updateData: {
      name?: string;
    } = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    // Actualizar la marca si hay campos para actualizar
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from("brand")
        .update(updateData)
        .eq("id", id);

      if (updateError) throw updateError;
    }

    // Obtener la marca actualizada
    const { data: updatedBrand, error: fetchError } = await supabase
      .from("brand")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;
    return updatedBrand;
  }
}
