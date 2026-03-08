import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ENV_CONFIG } from 'src/config/envConfig';
import { DataTokenType } from '../@types/token';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: ENV_CONFIG.JWT_AT_SECRET,
    });
  }

  validate(payload: DataTokenType) {
    return payload;
  }
}
