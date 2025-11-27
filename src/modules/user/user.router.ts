import { BaseRouter } from "@/shared/router";
import { UserController } from "./user.controller";

export class UserRouter extends BaseRouter<UserController> {
  constructor() {
    super(UserController);
  }

  public routes(): void {
    this.router.get("/users", (req, res) => this.controller.getUsers(req, res));
    this.router.delete("/users/:id", (req, res) => this.controller.deleteUser(req, res));
  }
}
