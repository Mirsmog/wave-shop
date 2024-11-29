import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  providers: [TokenService, PrismaService, JwtService],
})
export class TokenModule {}
