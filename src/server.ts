import express, { Router } from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ProductRouter } from "./modules/products/product.router";
import { BaseConfig } from "./config/config";
import { UomRouter } from "./modules/uom/uom.router";
import { AuthRouter } from "./modules/auth/auth.router";
import { UserRouter } from "./modules/user/user.router";

class MainServer extends BaseConfig {
  private PORT: number = this.numberEnvVar("PORT") || 8000;
  private app: express.Application = express();

  constructor() {
    super();
    this.middleware();
    this.listen();
  }

  private middleware() {
    this.app.use(morgan("dev"));

    const corsOptions = {
      origin: process.env.ALLOWED_ORIGINS?.split(",") || "*", // Dominios permitidos, usa '*' para todos o configura específicos en .env
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true, // Permite enviar cookies de autenticación cross-origin
      maxAge: 86400, // Tiempo en segundos que los resultados de una preflight request pueden ser cacheados
    };
    this.app.use(cors(corsOptions));

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.setupRoutes();
  }

  private setupRoutes() {
    this.app.use("/api", this.privateRoutes());
  }
  privateRoutes(): Router[] {
    return [
      new ProductRouter().router,
      new UomRouter().router,
      new AuthRouter().router,
      new UserRouter().router,
    ];
  }

  private listen() {
    this.app.listen(this.PORT, () => {
      console.log(`Server is running on port ${this.PORT}`);
    });
  }
}

new MainServer();
