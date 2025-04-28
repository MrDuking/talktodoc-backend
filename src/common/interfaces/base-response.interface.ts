export interface BaseResponse<T = any> {
    statusCode: number;
    message: string;
    success: boolean;
    data?: T;
    errors?: any;
    timestamp?: string;
    path?: string;
  }
