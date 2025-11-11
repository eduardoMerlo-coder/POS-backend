import { Router } from "express";

export class BaseRouter<T> {
  public router: Router;
  public controller: T;

  constructor(Tcontroller: { new (): T }) {
    this.router = Router();
    this.controller = new Tcontroller();
    this.routes();
  }
  public routes() {}
}
