import { HttpResponse } from "@/shared/response/http.response";
import { AuthService } from "./services/auth.service";
import { Request, Response } from "express";
import { loginDTO } from "./services/auth.schema";

export class AuthController {
  constructor(private readonly authService: AuthService = new AuthService()) {}

  private setRefreshCookie(res: Response, token: string, origin?: string) {
    const isLocal = origin?.includes("localhost");

    res.cookie("refreshToken", token, {
      httpOnly: true,
      secure: !isLocal, // HTTPS solo en producción
      sameSite: isLocal ? "lax" : "none", // permite cross-site cookies
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });
  }

  private clearRefreshCookie(res: Response, origin?: string) {
    const isLocal = origin?.includes("localhost");

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: !isLocal,
      sameSite: isLocal ? "lax" : "none",
    });
  }

  async login(req: Request, res: Response) {
    try {
      const { name, password } = req.body as loginDTO;
      const auth = await this.authService.login({ name, password });
      this.setRefreshCookie(res, auth.refreshToken, req.headers.origin);
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
      this.setRefreshCookie(res, auth.refreshToken, req.headers.origin);
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
      this.clearRefreshCookie(res, req.headers.origin);
      HttpResponse.Ok(res, responseData);
    } catch (err) {
      HttpResponse.BadRequest(res, err);
    }
  }
}
