import "./env";

// Only register module-alias in production (when running compiled JS)
if (process.env.NODE_ENV === 'production' || !__filename.endsWith('.ts')) {
  require('module-alias/register');
}

import express, { Router } from "express";
import morgan from "morgan";
import cors from "cors";
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

    // Configurar orígenes permitidos desde variable de entorno
    // Formato: "http://localhost:5173,https://post-front-three.vercel.app"
    const allowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
      : ["http://localhost:5173"]; // Fallback solo para desarrollo local

    const corsOptions = {
      origin: (origin: string | undefined, callback: Function) => {
        // Permitir peticiones sin origen (como mobile apps o Postman)
        if (!origin) return callback(null, true);

        // Verificar si el origen está en la lista de permitidos
        if (allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          // En desarrollo, permitir cualquier origen para facilitar el testing
          if (process.env.NODE_ENV !== "production") {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        }
      },
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin",
      ],
      exposedHeaders: ["Content-Range", "X-Content-Range"],
      credentials: true, // Permite enviar cookies de autenticación cross-origin
      maxAge: 86400, // Tiempo en segundos que los resultados de una preflight request pueden ser cacheados
      preflightContinue: false,
      optionsSuccessStatus: 204,
    };
    this.app.use(cors(corsOptions));

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    //this.app.use(cookieParser());
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
