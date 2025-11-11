import { UomService } from "./services/uom.service";
import { Request, Response } from "express";
import { HttpResponse } from "@/shared/response/http.response";

export class UomController {
  constructor(private readonly uomService: UomService = new UomService()) {}

  async createUom(req: Request, res: Response) {
    const uom = await this.uomService.createUom(req.body);
    HttpResponse.Ok(res, uom);
  }
  async updateUom(req: Request, res: Response) {
    const uom = await this.uomService.updateUom(
      Number(req.params.id),
      req.body
    );
    HttpResponse.Ok(res, uom);
  }
  async deleteUom(req: Request, res: Response) {
    const uom = await this.uomService.deleteUom(Number(req.params.id));
    HttpResponse.Ok(res, uom);
  }
  async getAllUoms(req: Request, res: Response) {
    const uoms = await this.uomService.getAllUoms();
    HttpResponse.Ok(res, uoms);
  }
}
