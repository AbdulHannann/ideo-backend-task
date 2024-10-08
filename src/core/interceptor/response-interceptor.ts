import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { IResponseInterface } from '../interface/response-interface';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, IResponseInterface>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<IResponseInterface> {
    return next.handle().pipe(
      map((response) => ({
        data: response.data || null,
        error: response?.error == true || false,
        statusCode: this.setStatusCode(
          response.statusCode ? response.statusCode : 200,
          context,
        ),
        message: response?.message || 'Success',
        displayMessage: response?.displayMessage || null,
      })),
    );
  }
  setStatusCode(code, context) {
    context.switchToHttp().getResponse().status(code);
    return code;
  }
}
