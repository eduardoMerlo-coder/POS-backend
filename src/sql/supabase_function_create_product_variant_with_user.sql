-- Función para crear product_variant y user_product_variant de forma atómica
-- Ejecutar esta función en el SQL Editor de Supabase

CREATE OR REPLACE FUNCTION create_product_variant_with_user(
  p_product_base_id INTEGER,
  p_presentation VARCHAR,
  p_capacity NUMERIC,
  p_unit_id INTEGER,
  p_quantity_per_package INTEGER,
  p_price NUMERIC,
  p_stock_quantity INTEGER,
  p_min_stock INTEGER,
  p_user_id UUID,
  p_barcode VARCHAR DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_variant_id INTEGER;
  v_result JSON;
BEGIN
  -- Insertar en product_variant
  INSERT INTO product_variant (
    product_id,
    name,
    capacity,
    uom_id,
    units,
    barcode,
    status
  )
  VALUES (
    p_product_base_id,
    p_presentation,
    p_capacity,
    p_unit_id,
    p_quantity_per_package,
    p_barcode,
    'ACTIVE'::"ProductStatus"
  )
  RETURNING id INTO v_variant_id;

  -- Insertar en user_product_variant
  INSERT INTO user_product_variant (
    user_id,
    variant_id,
    price,
    stock_quantity,
    min_stock
  )
  VALUES (
    p_user_id,
    v_variant_id,
    p_price,
    p_stock_quantity,
    p_min_stock
  );

  -- Obtener el resultado completo con relaciones
  SELECT json_build_object(
    'variant_id', pv.id,
    'product_id', pv.product_id,
    'name', pv.name,
    'status', pv.status,
    'barcode', pv.barcode,
    'units', pv.units,
    'capacity', pv.capacity,
    'uom_id', pv.uom_id,
    'uom', json_build_object(
      'id', uom.id,
      'name', uom.name,
      'description', uom.description
    ),
    'user_product_variant', json_build_object(
      'id', upv.id,
      'user_id', upv.user_id,
      'variant_id', upv.variant_id,
      'price', upv.price,
      'stock_quantity', upv.stock_quantity,
      'min_stock', upv.min_stock
    )
  )
  INTO v_result
  FROM product_variant pv
  LEFT JOIN unit_of_measure uom ON pv.uom_id = uom.id
  LEFT JOIN user_product_variant upv ON upv.variant_id = pv.id AND upv.user_id = p_user_id
  WHERE pv.id = v_variant_id;

  RETURN v_result;
END;
$$;
