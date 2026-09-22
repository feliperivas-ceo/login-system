import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('FACEBOOK_CLIENT_ID') ?? '',
      clientSecret: config.get<string>('FACEBOOK_CLIENT_SECRET') ?? '',
      callbackURL: config.get<string>('FACEBOOK_CALLBACK_URL') ?? '',
      profileFields: ['id', 'displayName', 'emails', 'photos'],
    });
  }

  validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    done(null, {
      providerAccountId: profile.id,
      email: profile.emails?.[0]?.value,
      name: profile.displayName,
      imageUrl: profile.photos?.[0]?.value,
    });
  }
}
