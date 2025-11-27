import { BaseRouter } from "@/shared/router";
import { AuthController } from "./auth.controller";
import { validateSchema } from "@/shared/middleware/base";
import { createUserSchema } from "./services/auth.schema";

export class AuthRouter extends BaseRouter<AuthController> {
  constructor() {
    super(AuthController);
  }
  public routes(): void {
    this.router.post("/create-user", validateSchema(createUserSchema), (req, res) => this.controller.createUser(req, res));
  }
}
