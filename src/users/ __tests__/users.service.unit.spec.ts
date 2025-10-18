import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { RoleEnum } from '../dto/role.enum';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('deve lançar erro se o usuário já existir', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'ana@example.com',
    });

    await expect(
      service.createUser({
          name: 'Ana',
          email: 'ana@example.com',
          password: '123456',
          role: RoleEnum.CLIENT
      }),
    ).rejects.toThrow('Email já cadastrado');
  });

  it('deve criar um novo usuário se não existir', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Ana',
      email: 'ana@example.com',
    });

    const result = await service.createUser({
        name: 'Ana',
        email: 'ana@example.com',
        password: '123456',
        role: RoleEnum.CLIENT
    });

    expect(result).toEqual({
      id: 1,
      name: 'Ana',
      email: 'ana@example.com',
    });
  });
});
