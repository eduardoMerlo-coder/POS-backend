-- Función para crear un producto base con sus categorías de forma atómica
-- Ejecutar esta función en el SQL Editor de Supabase
-- Esta función garantiza que la creación del producto y sus categorías sea atómica:
-- si la inserción de categorías falla, la creación del producto se revierte automáticamente

CREATE OR REPLACE FUNCTION create_base_product(
  p_name VARCHAR,
  p_brand_id INTEGER,
  p_category_ids INTEGER[] DEFAULT ARRAY[]::INTEGER[]
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_product_id INTEGER;
  v_result JSON;
BEGIN
  -- Insertar el producto base
  INSERT INTO product (name, brand_id)
  VALUES (p_name, p_brand_id)
  RETURNING id INTO v_product_id;

  -- Insertar las relaciones con categorías si hay alguna
  IF array_length(p_category_ids, 1) > 0 THEN
    INSERT INTO product_category (product_id, category_id)
    SELECT v_product_id, unnest(p_category_ids);
  END IF;

  -- Obtener el producto completo con sus relaciones
  SELECT json_build_object(
    'id', p.id,
    'name', p.name,
    'brand_id', p.brand_id,
    'brand', json_build_object(
      'id', b.id,
      'name', b.name
    ),
    'categories', COALESCE(
      json_agg(
        json_build_object(
          'id', c.id,
          'name', c.name,
          'description', c.description
        )
      ) FILTER (WHERE c.id IS NOT NULL),
      '[]'::json
    )
  )
  INTO v_result
  FROM product p
  LEFT JOIN brand b ON p.brand_id = b.id
  LEFT JOIN product_category pc ON p.id = pc.product_id
  LEFT JOIN category c ON pc.category_id = c.id
  WHERE p.id = v_product_id
  GROUP BY p.id, p.name, p.brand_id, b.id, b.name;

  RETURN v_result;
END;
$$;
