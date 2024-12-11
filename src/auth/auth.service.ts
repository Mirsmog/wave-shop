import { verify } from 'argon2';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '@/users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UsersService) {}
  public async validateUser(email: string, password: string) {
    const existingUser = await this.userService.findByEmail(email);

    if (!existingUser) {
      throw new UnauthorizedException('invalid credentials');
    }

    const isPasswordMatch = await verify(password, existingUser.password);

    if (!isPasswordMatch) {
      throw new UnauthorizedException('invalid credentials');
    }

    return existingUser;
  }
}
