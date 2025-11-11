import { prisma } from "@/data/postgres";
import { UnitOfMeasure } from "@prisma/client";

export class UomService {
  async createUom(data: any) {
    const uom = await prisma.unitOfMeasure.create({
      data,
    });
    return uom;
  }
  async findOrCreateUom(unit: string): Promise<UnitOfMeasure> {
    try {
      // Intentar encontrar la unidad de medida existente
      const existingUom = await prisma.unitOfMeasure.findUnique({
        where: { unit },
      });

      if (existingUom) {
        return existingUom;
      }

      return await this.createUom({ unit });
    } catch (error: any) {
      throw error;
    }
  }
  async updateUom(id: number, data: any) {
    const uom = await prisma.unitOfMeasure.update({
      where: { id },
      data,
    });
    return uom;
  }
  async deleteUom(id: number) {
    const uom = await prisma.unitOfMeasure.delete({
      where: { id },
    });
    return uom;
  }
  async getUom(id: number) {
    const uom = await prisma.unitOfMeasure.findUnique({
      where: { id },
    });
    return uom;
  }

  async getAllUoms() {
    const uoms = await prisma.unitOfMeasure.findMany();
    return uoms;
  }
}
