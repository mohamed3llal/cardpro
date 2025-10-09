export class ApiResponse<T> {
  constructor(
    public success: boolean,
    public data?: T,
    public message?: string,
    public errors?: any[]
  ) {}

  static success<T>(data: T, message?: string): ApiResponse<T> {
    return new ApiResponse(true, data, message);
  }

  static error(message: string, errors?: any[]): ApiResponse<null> {
    return new ApiResponse(false, null, message, errors);
  }
}
