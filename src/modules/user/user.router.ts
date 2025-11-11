import { BaseRouter } from "@/shared/router";
import { UserController } from "./user.controller";
import { validateSchema } from "@/shared/middleware/base";
import { createUserSchema } from "./user.schema";

export class UserRouter extends BaseRouter<UserController> {
  constructor() {
    super(UserController);
  }

  public routes(): void {
    this.router.post("/user", validateSchema(createUserSchema), (req, res) =>
      this.controller.createBaseUser(req, res)
    );
    this.router.get("/users", (req, res) => this.controller.getUsers(req, res));
  }
}
