import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-linkedin-oauth2';

@Injectable()
export class LinkedinStrategy extends PassportStrategy(Strategy, 'linkedin') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('LINKEDIN_CLIENT_ID') ?? '',
      clientSecret: config.get<string>('LINKEDIN_CLIENT_SECRET') ?? '',
      callbackURL: config.get<string>('LINKEDIN_CALLBACK_URL') ?? '',
      scope: ['openid', 'profile', 'email'],
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
