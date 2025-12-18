import { createUserDTO, updateUserMetadataDTO } from "./auth.schema";
import { supabase } from "@/lib/supabase";

export class AuthService {
  async createUser({ email, password, role_id }: createUserDTO) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role_id: role_id
      }
    })

    if (error) throw error;

    if (!data.user?.id) throw new Error("User not found");

    const { error: profileError } = await supabase.from("profile").insert({
      id: data.user?.id,
      role_id,
    })
    if (profileError) throw profileError;

    return data;
  }

  async updateUserMetadata({ user_id, metadata }: updateUserMetadataDTO) {
    // Obtener la metadata actual del usuario
    const { data: currentUser, error: getUserError } = await supabase.auth.admin.getUserById(user_id);
    
    if (getUserError) throw getUserError;
    if (!currentUser.user) throw new Error("Usuario no encontrado");

    // Obtener la metadata actual (puede ser null o un objeto)
    const currentMetadata = (currentUser.user.user_metadata as Record<string, any>) || {};

    // Combinar la metadata existente con la nueva (la nueva sobrescribe la existente)
    const updatedMetadata: Record<string, any> = {
      ...currentMetadata,
      ...metadata,
    };

    // Actualizar la metadata del usuario
    const { data, error } = await supabase.auth.admin.updateUserById(user_id, {
      user_metadata: updatedMetadata,
    });

    if (error) throw error;

    return data;
  }
}
