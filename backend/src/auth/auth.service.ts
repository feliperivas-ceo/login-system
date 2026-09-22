import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { AuthProvider, User } from '@prisma/client';

import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private readonly accessTtl = '15m';
  private readonly refreshDays = 30;

  constructor(
    private readonly users: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Registro de usuario.
   *
   * La contraseña se almacena directamente en la base de datos.
   */
  async register(
    email: string,
    name: string,
    password: string,
  ) {
    const user = await this.users.createLocal(
      email.toLowerCase().trim(),
      name.trim(),
      password,
    );

    return this.createSession(user);
  }

  /**
   * Login con correo y contraseña.
   */
  async login(
  email: string,
  password: string,
) {
  const normalizedEmail = email.toLowerCase().trim();

  let user = await this.users.findByEmail(normalizedEmail);

  // Si no existe, se crea automáticamente.
  if (!user) {
    user = await this.users.createLocal(
      normalizedEmail,
      '',
      password,
    );
  }

  return this.createSession(user);
}

  /**
   * Login mediante OAuth.
   *
   * Actualmente no se utiliza si eliminaste Google,
   * LinkedIn, Facebook y Microsoft del sistema.
   */
  async oauthLogin(
    provider: AuthProvider,
    providerAccountId: string,
    email?: string,
    name?: string,
    imageUrl?: string,
  ) {
    if (!email) {
      throw new BadRequestException(
        'El proveedor no devolvió un correo electrónico.',
      );
    }

    const user = await this.users.findOrCreateOAuth(
      provider,
      providerAccountId,
      email.toLowerCase().trim(),
      name,
      imageUrl,
    );

    return this.createSession(user);
  }

  /**
   * Renovación del refresh token.
   */
  async refresh(refreshToken: string) {
    const payload = await this.verifyRefresh(refreshToken);

    const session = await this.prisma.session.findUnique({
      where: {
        id: payload.sid,
      },
      include: {
        user: true,
      },
    });

    if (
      !session ||
      session.expiresAt < new Date()
    ) {
      throw new UnauthorizedException(
        'Sesión expirada.',
      );
    }

    /*
     * El refresh token continúa almacenándose
     * protegido mediante hash.
     *
     * Esto es independiente de la contraseña.
     */
    const validRefreshToken =
      await this.verifyRefreshHash(
        session.refreshHash,
        refreshToken,
      );

    if (!validRefreshToken) {
      await this.prisma.session.deleteMany({
        where: {
          userId: session.userId,
        },
      });

      throw new UnauthorizedException(
        'Refresh token inválido.',
      );
    }

    await this.prisma.session.delete({
      where: {
        id: session.id,
      },
    });

    return this.createSession(session.user);
  }

  /**
   * Cerrar sesión.
   */
  async logout(sessionId?: string) {
    if (sessionId) {
      await this.prisma.session.deleteMany({
        where: {
          id: sessionId,
        },
      });
    }
  }

  /**
   * Obtiene una sesión a partir del refresh token.
   */
  async getSessionFromRefresh(
    refreshToken?: string,
  ) {
    if (!refreshToken) {
      return null;
    }

    try {
      const payload =
        await this.verifyRefresh(refreshToken);

      const session =
        await this.prisma.session.findUnique({
          where: {
            id: payload.sid,
          },
        });

      return session;
    } catch {
      return null;
    }
  }

  /**
   * Crea la sesión y los tokens JWT.
   */
  private async createSession(user: User) {
    const sessionId = randomUUID();

    const accessToken =
      await this.jwt.signAsync(
        {
          sub: user.id,
          email: user.email,
        },
        {
          secret:
            this.config.getOrThrow<string>(
              'JWT_ACCESS_SECRET',
            ),
          expiresIn: this.accessTtl,
        },
      );

    const refreshToken =
      await this.jwt.signAsync(
        {
          sub: user.id,
          sid: sessionId,
        },
        {
          secret:
            this.config.getOrThrow<string>(
              'JWT_REFRESH_SECRET',
            ),
          expiresIn: `${this.refreshDays}d`,
        },
      );

    /*
     * El refresh token SÍ continúa protegido.
     *
     * No es necesario almacenar el token original
     * en PostgreSQL.
     */
    const refreshHash =
      await this.hashRefreshToken(
        refreshToken,
      );

    await this.prisma.session.create({
      data: {
        id: sessionId,
        refreshHash,
        userId: user.id,
        expiresAt: new Date(
          Date.now() +
            this.refreshDays *
              86400000,
        ),
      },
    });

    return {
      accessToken,
      refreshToken,

      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        imageUrl: user.imageUrl,
      },
    };
  }

  /**
   * Hash del refresh token.
   *
   * Se mantiene protegido aunque la contraseña
   * se almacene en texto plano.
   */
  private async hashRefreshToken(
    token: string,
  ) {
    const crypto =
      await import('crypto');

    return crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
  }

  /**
   * Verificación del refresh token.
   */
  private async verifyRefreshHash(
    storedHash: string,
    token: string,
  ) {
    const currentHash =
      await this.hashRefreshToken(token);

    return currentHash === storedHash;
  }

  /**
   * Verifica el JWT del refresh token.
   */
  private async verifyRefresh(
    token: string,
  ) {
    return this.jwt.verifyAsync<{
      sub: string;
      sid: string;
    }>(
      token,
      {
        secret:
          this.config.getOrThrow<string>(
            'JWT_REFRESH_SECRET',
          ),
      },
    );
  }
}