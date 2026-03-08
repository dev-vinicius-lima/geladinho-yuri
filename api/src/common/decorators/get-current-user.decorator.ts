import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { HttpRequestType } from 'src/@types/http';

export const GetCurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    // eslint-disable-next-line
    const request = context.switchToHttp().getRequest() as HttpRequestType;
    return request.user;
  },
);
