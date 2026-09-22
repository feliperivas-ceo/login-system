import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('MICROSOFT_CLIENT_ID') ?? '',
      clientSecret: config.get<string>('MICROSOFT_CLIENT_SECRET') ?? '',
      callbackURL: config.get<string>('MICROSOFT_CALLBACK_URL') ?? '',
      scope: ['user.read'],
    });
  }

  validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    done(null, {
      providerAccountId: profile.id,
      email: profile.emails?.[0]?.value || profile._json?.mail || profile._json?.userPrincipalName,
      name: profile.displayName,
      imageUrl: undefined,
    });
  }
}
