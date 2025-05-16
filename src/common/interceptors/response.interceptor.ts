import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Request } from 'express'
import { Observable, map } from 'rxjs'

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: Request = context.switchToHttp().getRequest()

    return next.handle().pipe(
      map(data => ({
        statusCode: 200,
        message: data?.message || 'Success',
        success: true,
        data: data?.data ?? data,
        timestamp: new Date().toISOString(),
        path: req.url,
      })),
    )
  }
}
