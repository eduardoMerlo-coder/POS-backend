import { HttpResponse } from "@/shared/response/http.response";
import { AuthService } from "./services/auth.service";
import { Request, Response } from "express";
import { loginDTO } from "./services/auth.schema";

export class AuthController {
  constructor(private readonly authService: AuthService = new AuthService()) {}

  async login(req: Request, res: Response) {
    try {
      const { name, password } = req.body as loginDTO;
      const auth = await this.authService.login({ name, password });

      // Set refresh token in HttpOnly cookie
      res.cookie("refreshToken", auth.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Remove refresh token from response body
      const { refreshToken, ...responseData } = auth;
      HttpResponse.Ok(res, responseData);
    } catch (err) {
      HttpResponse.BadRequest(res, err);
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        HttpResponse.BadRequest(res, "No refresh token provided");
        return;
      }

      const auth = await this.authService.refresh({ refreshToken });

      // Set new refresh token in HttpOnly cookie
      res.cookie("refreshToken", auth.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Remove refresh token from response body
      const { refreshToken: _, ...responseData } = auth;
      HttpResponse.Ok(res, responseData);
    } catch (err) {
      HttpResponse.BadRequest(res, err);
    }
  }
  async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        HttpResponse.BadRequest(res, "No refresh token provided");
      }

      const responseData = await this.authService.logout({ refreshToken });

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      HttpResponse.Ok(res, responseData);
    } catch (err) {
      HttpResponse.BadRequest(res, err);
    }
  }
}
