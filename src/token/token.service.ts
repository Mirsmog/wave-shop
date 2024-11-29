import { PrismaService } from '@/prisma/prisma.service';
import { hash, verify } from 'argon2';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import ms from 'ms';
import { UsersService } from '@/users/users.service';

@Injectable()
export class TokenService {
  private readonly JWT_ACCESS_KEY = this.configService.getOrThrow<string>('JWT_ACCESS_KEY');
  private readonly JWT_ACCESS_EXPIN = this.configService.getOrThrow<string>('JWT_ACCESS_EXPIN');
  private readonly JWT_REFRESH_KEY = this.configService.getOrThrow<string>('JWT_REFRESH_KEY');
  private readonly JWT_REFRESH_EXPIN = this.configService.getOrThrow<string>('JWT_REFRESH_EXPIN');
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  public async validateRefreshToken(token: string) {
    let payload: { jti: string; sub: string };

    try {
      payload = this.jwtService.verify(token, {
        secret: this.JWT_REFRESH_KEY,
      });
    } catch (error) {
      throw new UnauthorizedException('invalid token');
    }

    const existingToken = await this.findRefreshToken(payload.jti);

    const isValidToken =
      existingToken && existingToken.expiresAt > new Date() && (await verify(token, existingToken.token));

    if (!isValidToken) throw new UnauthorizedException('token is invalid or expired');

    return payload;
  }

  public async refreshTokens(token: string, jti: string) {
    const { sub, jti: oldJti } = await this.validateRefreshToken(token);
    const user = await this.usersService.findById(sub);

    if (!user) throw new NotFoundException('user not found');

    const { accessToken, refreshToken } = await this.generateTokens(user.id, jti);

    await this.saveRefreshToken(user.id, refreshToken, jti);
    await this.revokeRefreshToken(oldJti);

    return { accessToken, refreshToken };
  }

  public async generateTokens(userId: string, jti: string) {
    const accessPayload = { sub: userId };
    const refreshPayload = { sub: userId, jti };

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.JWT_ACCESS_KEY,
      expiresIn: this.JWT_ACCESS_EXPIN,
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.JWT_REFRESH_KEY,
      expiresIn: this.JWT_REFRESH_EXPIN,
    });

    await this.saveRefreshToken(userId, refreshToken, jti);

    return { accessToken, refreshToken };
  }

  public async revokeRefreshToken(jti: string) {
    try {
      await this.prisma.refreshToken.delete({ where: { id: jti } });
    } catch (error) {
      throw new NotFoundException('token not found');
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  public async cleanExpiredTokens() {
    await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }

  private async saveRefreshToken(userId: string, token: string, jti: string) {
    try {
      const expiresAt = new Date(Date.now() + ms(this.JWT_REFRESH_EXPIN));
      const data = {
        id: jti,
        token: await hash(token),
        userId,
        expiresAt,
      };
      const savedToken = await this.prisma.refreshToken.create({
        data,
      });
      return savedToken;
    } catch (error) {
      throw new InternalServerErrorException('error during saving token');
    }
  }

  private async findRefreshToken(jti: string) {
    try {
      return await this.prisma.refreshToken.findUniqueOrThrow({ where: { id: jti } });
    } catch (error) {
      throw new NotFoundException('token not found');
    }
  }
}
