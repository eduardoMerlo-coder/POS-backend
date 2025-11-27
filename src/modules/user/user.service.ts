import { supabase } from "@/lib/supabase";

export class UserService {
  async getUsers() {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) throw error;
    return data;
  }
  async deleteUser(id: string) {
    const { data, error } = await supabase.auth.admin.deleteUser(id);
    if (error) throw error;
    const { error: profileError } = await supabase.from("profile").delete().eq("id", id);
    if (profileError) throw profileError;
    return data;
  }
}
