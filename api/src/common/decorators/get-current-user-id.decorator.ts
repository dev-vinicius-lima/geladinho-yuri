import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { HttpRequestType } from 'src/@types/http';

export const GetCurrentUserId = createParamDecorator(
  (data: undefined, context: ExecutionContext): string => {
    // eslint-disable-next-line
    const request = context.switchToHttp().getRequest() as HttpRequestType;
    return request.user['sub'];
  },
);
