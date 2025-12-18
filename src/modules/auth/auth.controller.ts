import { HttpResponse } from "@/shared/response/http.response";
import { AuthService } from "./services/auth.service";
import { Request, Response } from "express";

export class AuthController {
  constructor(private readonly authService: AuthService = new AuthService()) { }

  async createUser(req: Request, res: Response) {
    try {
      const user = await this.authService.createUser({
        email: req.body.email,
        password: req.body.password,
        role_id: req.body.role_id,
      });
      HttpResponse.Ok(res, user)
    } catch (err) {
      HttpResponse.BadRequest(res, err);
    }
  }

  async updateUserMetadata(req: Request, res: Response) {
    try {
      const result = await this.authService.updateUserMetadata({
        user_id: req.body.user_id,
        metadata: req.body.metadata,
      });
      HttpResponse.Ok(res, result);
    } catch (err) {
      HttpResponse.BadRequest(res, err);
    }
  }
}
