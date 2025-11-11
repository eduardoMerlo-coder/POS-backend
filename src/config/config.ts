import * as dotenv from "dotenv";

export class BaseConfig {
  constructor() {
    dotenv.config({
      path: this.getPathEnv(),
    });
  }
  public getEnvVar(key: string): string {
    return process.env[key] ?? "";
  }
  public numberEnvVar(key: string): number {
    return Number(this.getEnvVar(key));
  }
  public getNodeEnv(): string {
    return this.getEnvVar("NODE_ENV");
  }
  public getPathEnv(): string {
    const pathArray = [".env"];
    const env = this.getEnvVar("NODE_ENV");
    if (env) pathArray.unshift("." + env);
    return pathArray.join("");
  }
}
