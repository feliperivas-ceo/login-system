import { ConflictException, Injectable } from '@nestjs/common';
import { AuthProvider, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async createLocal(email: string, name: string, passwordHash: string) {
    const existing = await this.findByEmail(email);
    if (existing) throw new ConflictException('El correo ya está registrado.');

    return this.prisma.user.create({
      data: {
        email,
        name,
        password: passwordHash,
      },
    });
  }

  async findOrCreateOAuth(
    provider: AuthProvider,
    providerAccountId: string,
    email: string,
    name?: string,
    imageUrl?: string,
  ): Promise<User> {
    const account = await this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider,
          providerAccountId,
        },
      },
      include: { user: true },
    });

    if (account) return account.user;

    const existingUser = await this.findByEmail(email);

    if (existingUser) {
      await this.prisma.account.create({
        data: {
          provider,
          providerAccountId,
          userId: existingUser.id,
        },
      });
      return existingUser;
    }

    return this.prisma.user.create({
      data: {
        email,
        name,
        imageUrl,
        accounts: {
          create: {
            provider,
            providerAccountId,
          },
        },
      },
    });
  }
}
