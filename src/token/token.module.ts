import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { UsersService } from '@/users/users.service';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  providers: [TokenService, PrismaService, JwtService, UsersService],
  exports: [TokenService, PrismaService, JwtService, UsersService],
})
export class TokenModule {}
