import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { DataTokenType } from 'src/modules/auth/@types/token';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as DataTokenType;

    if (!user?.admin) {
      throw new ForbiddenException(
        'Acesso restrito a administradores.',
      );
    }

    return true;
  }
}
