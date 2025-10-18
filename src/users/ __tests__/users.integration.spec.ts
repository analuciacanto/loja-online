import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { UsersModule } from '../users.module';
import { UsersService } from '../users.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { RoleEnum } from '../dto/role.enum';

// Mock do PrismaService
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

describe('UsersController (Integração Completa)', () => {
  let app: INestApplication;
  let usersService: UsersService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.useLogger(false);

    await app.init();
    usersService = moduleRef.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===================== Sucesso =====================
  it('Deve criar um usuário CLIENT com dados válidos', async () => {
    const dto = { name: 'Ana', email: 'ana@test.com', password: '123456', role: RoleEnum.CLIENT };
    mockPrismaService.user.findUnique.mockResolvedValue(null);
    mockPrismaService.user.create.mockResolvedValue({ id: 1, name: dto.name, email: dto.email, role: dto.role, isActive: true, createdAt: new Date() });

    const response = await request(app.getHttpServer()).post('/users/register').send(dto).expect(201);

    expect(response.body).toHaveProperty('message', 'Usuário criado com sucesso');
    expect(response.body.user).toMatchObject({ name: dto.name, email: dto.email, role: dto.role });
    expect(response.body.user).not.toHaveProperty('password'); // Segurança
  });

  it('Deve criar um usuário SELLER com sucesso', async () => {
    const dto = { name: 'Vendedor', email: 'vendedor@test.com', password: '123456', role: RoleEnum.SELLER };
    mockPrismaService.user.findUnique.mockResolvedValue(null);
    mockPrismaService.user.create.mockResolvedValue({ id: 2, name: dto.name, email: dto.email, role: dto.role, isActive: true, createdAt: new Date() });

    const response = await request(app.getHttpServer()).post('/users/register').send(dto).expect(201);
    expect(response.body.user.role).toBe(RoleEnum.SELLER);
  });

  // ===================== Falha =====================
  it('Deve retornar erro se email já existir', async () => {
    const dto = { name: 'Ana', email: 'ana@test.com', password: '123456', role: RoleEnum.CLIENT };
    mockPrismaService.user.findUnique.mockResolvedValue(dto);

    const response = await request(app.getHttpServer()).post('/users/register').send(dto).expect(400);
    expect(response.body.message).toEqual('Email já cadastrado');
  });

  it('Deve retornar erro se nome estiver vazio', async () => {
    const dto = { name: '', email: 'teste@test.com', password: '123456', role: RoleEnum.CLIENT };
    const response = await request(app.getHttpServer()).post('/users/register').send(dto).expect(400);
    expect(response.body.message).toContain('name should not be empty');
  });

  it('Deve retornar erro se email for inválido', async () => {
    const dto = { name: 'Ana', email: 'emailinvalido', password: '123456', role: RoleEnum.CLIENT };
    const response = await request(app.getHttpServer()).post('/users/register').send(dto).expect(400);
    expect(response.body.message).toContain('email must be an email');
  });

  it('Deve retornar erro se senha tiver menos de 6 caracteres', async () => {
    const dto = { name: 'Ana', email: 'teste@test.com', password: '123', role: RoleEnum.CLIENT };
    const response = await request(app.getHttpServer()).post('/users/register').send(dto).expect(400);
    expect(response.body.message).toContain('password must be longer than or equal to 6 characters');
  });

  it('Deve retornar erro se role for inválida', async () => {
    const dto = { name: 'Ana', email: 'teste@test.com', password: '123456', role: 'INVALID' as any };
    const response = await request(app.getHttpServer()).post('/users/register').send(dto).expect(400);
    expect(response.body.message).toContain('role must be one of the following values: CLIENT, SELLER');
  });

  it('Deve retornar erro 500 se houver falha no banco', async () => {
    const dto = { name: 'Ana', email: 'ana@test.com', password: '123456', role: RoleEnum.CLIENT };
    mockPrismaService.user.findUnique.mockResolvedValue(null);
    mockPrismaService.user.create.mockRejectedValue(new Error('DB failure'));

    const response = await request(app.getHttpServer()).post('/users/register').send(dto).expect(500);
    expect(response.body.message).toEqual('Internal server error');
  });

  // ===================== Edge Cases =====================
  it('Deve criar usuário com nome longo', async () => {
    const longName = 'A'.repeat(255);
    const dto = { name: longName, email: 'long@test.com', password: '123456', role: RoleEnum.CLIENT };
    mockPrismaService.user.findUnique.mockResolvedValue(null);
    mockPrismaService.user.create.mockResolvedValue({ id: 3, name: dto.name, email: dto.email, role: dto.role, isActive: true, createdAt: new Date() });

    const response = await request(app.getHttpServer()).post('/users/register').send(dto).expect(201);
    expect(response.body.user.name).toBe(longName);
  });

  it('Deve criar usuário com email válido e complexo', async () => {
    const dto = { name: 'Ana', email: 'user+teste@example.com', password: '123456', role: RoleEnum.CLIENT };
    mockPrismaService.user.findUnique.mockResolvedValue(null);
    mockPrismaService.user.create.mockResolvedValue({ id: 4, name: dto.name, email: dto.email, role: dto.role, isActive: true, createdAt: new Date() });

    const response = await request(app.getHttpServer()).post('/users/register').send(dto).expect(201);
    expect(response.body.user.email).toBe(dto.email);
  });
});
