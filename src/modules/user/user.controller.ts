import { HttpResponse } from "@/shared/response/http.response";
import { UserService } from "./user.service";
import { Request, Response } from "express";
import { CreateUserDto } from "./user.schema";

export class UserController {
  constructor(private readonly userService: UserService = new UserService()) {}

  public getUsers = async (req: Request, res: Response) => {
    try {
      const products = await this.userService.getUsers();
      HttpResponse.Ok(res, products);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };

  public createBaseUser = async (req: Request, res: Response) => {
    const userData = req.body as CreateUserDto;
    try {
      const Users = await this.userService.createUser(userData);
      HttpResponse.Ok(res, Users);
    } catch (error: any) {
      HttpResponse.BadRequest(res, error);
    }
  };
}
