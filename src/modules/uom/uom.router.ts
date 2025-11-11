import { BaseRouter } from "@/shared/router";
import { UomController } from "./uom.controller";

export class UomRouter extends BaseRouter<UomController> {
  constructor() {
    super(UomController);
  }
  public routes() {
    this.router.post("/uom", (req, res) => this.controller.createUom(req, res));
    this.router.put("/uom/:id", (req, res) =>
      this.controller.updateUom(req, res)
    );
    this.router.delete("/uom/:id", (req, res) =>
      this.controller.deleteUom(req, res)
    );
    this.router.get("/uom", (req, res) => this.controller.getAllUoms(req, res));
  }
}
