import { hash } from 'argon2';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  public async findById(id: string) {
    try {
      return await this.prisma.user.findUnique({
        where: { id },
        include: {
          stores: true,
          orders: true,
          favorites: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  public async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email },
      include: {
        stores: true,
        orders: true,
        favorites: true,
      },
    });
  }

  public async create(dto: CreateUserDto) {
    return await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: dto.password ? await hash(dto.password) : '',
      },
    });
  }
}
