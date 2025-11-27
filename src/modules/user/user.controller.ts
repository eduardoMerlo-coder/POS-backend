import { HttpResponse } from "@/shared/response/http.response";
import { UserService } from "./user.service";
import { Request, Response } from "express";

export class UserController {
  constructor(private readonly userService: UserService = new UserService()) { }

  public getUsers = async (req: Request, res: Response) => {
    try {
      const users = await this.userService.getUsers();
      HttpResponse.Ok(res, users);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };

  public deleteUser = async (req: Request, res: Response) => {
    try {
      const user = await this.userService.deleteUser(req.params.id);
      HttpResponse.Ok(res, user);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };
}
