import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-yandex';

@Injectable()
export class YandexStrategy extends PassportStrategy(Strategy, 'yandex') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientId: configService.getOrThrow('YANDEX_CLIENT_ID'),
      clientSecret: configService.getOrThrow('YANDEX_CLIENT_SECRET'),
      callbackUrl: configService.getOrThrow('SERVER_URL') + '/auth/yandex/callback',
    });
  }

  async validate(_accessToken: string, _refreshToken: string, profile: Profile, done: any) {
    const { username, emails, photos } = profile;
    const user = {
      name: username,
      email: emails[0].value,
      photo: photos[0].value,
    };
    done(null, user);
  }
}
