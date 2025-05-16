import { Request } from 'express'
import { BaseResponse } from '../interfaces/base-response.interface'

export function buildResponse<T>(
  data: T,
  message = 'Success',
  statusCode = 200,
  req?: Request,
): BaseResponse<T> {
  return {
    statusCode,
    message,
    success: true,
    data,
    timestamp: new Date().toISOString(),
    path: req?.url || '',
  }
}

export function buildErrorResponse(
  message = 'Something went wrong',
  errors: any = null,
  statusCode = 400,
  req?: Request,
): BaseResponse<null> {
  return {
    statusCode,
    message,
    success: false,
    errors,
    timestamp: new Date().toISOString(),
    path: req?.url || '',
  }
}
