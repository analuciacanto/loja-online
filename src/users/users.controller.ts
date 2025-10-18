import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    const user = await this.usersService.createUser(dto);
    return { message: 'Usuário criado com sucesso', user };
  }
}
