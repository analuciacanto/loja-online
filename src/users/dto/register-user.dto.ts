import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { RoleEnum} from './role.enum';

export class RegisterUserDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsEnum(RoleEnum)
  role: RoleEnum;
}
