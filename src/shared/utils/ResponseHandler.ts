import { Response } from "express";

export class ResponseHandler {
  static success(res: Response, data: any, statusCode: number = 200) {
    return res.status(statusCode).json(data);
  }

  static error(res: Response, message: string, statusCode: number = 500) {
    return res.status(statusCode).json({ message });
  }

  static created(res: Response, data: any) {
    return res.status(201).json(data);
  }

  static noContent(res: Response) {
    return res.status(204).send();
  }
}
