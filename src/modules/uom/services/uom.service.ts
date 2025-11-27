import { supabase } from "@/lib/supabase";

export class UomService {
  async createUom(data: any) {
    const { data: newUom, error } = await supabase.from("unit_of_measure").insert(
      data
    );
    if (error) throw error;
    return newUom;
  }
  async updateUom(id: number, data: any) {
    const { data: updatedUom, error } = await supabase.from("unit_of_measure").update(
      data
    ).eq("id", id);
    if (error) throw error;
    return updatedUom;
  }
  async deleteUom(id: number) {
    const { data: deletedUom, error } = await supabase.from("unit_of_measure").delete().eq("id", id);
    if (error) throw error;
    return deletedUom;
  }
  async getUom(id: number) {
    const { data: uom, error } = await supabase.from("unit_of_measure").select("*").eq("id", id);
    if (error) throw error;
    return uom;
  }

  async getAllUoms() {
    const { data: uoms, error } = await supabase.from("unit_of_measure").select("*");
    if (error) throw error;
    return uoms;
  }
}
