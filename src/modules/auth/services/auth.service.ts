import { createUserDTO } from "./auth.schema";
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
}
