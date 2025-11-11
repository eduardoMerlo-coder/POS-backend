import { Response } from "express";

enum HttpStatus {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

export abstract class HttpResponse {
  constructor() {}

  public static Ok(res: Response, data: any) {
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      message: "OK",
      data: data,
    });
  }

  public static BadRequest(res: Response, data: any) {
    const payload = data instanceof Error ? data.message : data;
    return res.status(HttpStatus.BAD_REQUEST).json({
      status: HttpStatus.BAD_REQUEST,
      message: "Bad Request",
      data: payload,
    });
  }

  public static Unauthorized(res: Response) {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      status: HttpStatus.UNAUTHORIZED,
      message: "Unauthorized",
    });
  }

  public static Forbidden(res: Response) {
    return res.status(HttpStatus.FORBIDDEN).json({
      status: HttpStatus.FORBIDDEN,
      message: "Forbidden",
    });
  }

  public static NotFound(res: Response) {
    return res.status(HttpStatus.NOT_FOUND).json({
      status: HttpStatus.NOT_FOUND,
      message: "Not Found",
    });
  }

  public static InternalServerError(res: Response) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal Server Error",
    });
  }
}
