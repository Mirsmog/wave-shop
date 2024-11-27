import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MaxLength(12)
  @MinLength(4)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  @MinLength(6)
  password?: string;
}
