import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';

import { TokenService } from '@/token/token.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(request) => request.cookies.Refresh]),
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_KEY'),
      passReqToCallback: true,
    });
  }
  async validate(request: Request) {
    const token: string = request.cookies.Refresh;
    if (!token) throw new UnauthorizedException('token is missing');
    return await this.tokenService.validateRefreshToken(token);
  }
}
