-- Función para actualizar las categorías de un producto de forma atómica
-- Ejecutar esta función en el SQL Editor de Supabase
-- Esta función garantiza que la actualización de categorías sea atómica:
-- si la inserción falla, la eliminación se revierte automáticamente

CREATE OR REPLACE FUNCTION update_product_categories(
  p_product_id INTEGER,
  p_category_ids INTEGER[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Eliminar todas las categorías existentes del producto
  DELETE FROM product_category
  WHERE product_id = p_product_id;

  -- Insertar las nuevas categorías si hay alguna
  IF array_length(p_category_ids, 1) > 0 THEN
    INSERT INTO product_category (product_id, category_id)
    SELECT p_product_id, unnest(p_category_ids);
  END IF;
END;
$$;
