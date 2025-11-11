import { BaseRouter } from "@/shared/router";
import { AuthController } from "./auth.controller";
import { validateSchema } from "@/shared/middleware/base";
import { loginSchema } from "./services/auth.schema";

export class AuthRouter extends BaseRouter<AuthController> {
  constructor() {
    super(AuthController);
  }
  public routes(): void {
    this.router.post("/login", validateSchema(loginSchema), (req, res) =>
      this.controller.login(req, res)
    );
    this.router.post("/refresh", (req, res) =>
      this.controller.refresh(req, res)
    );
    this.router.post("/logout", (req, res) => this.controller.logout(req, res));
  }
}
