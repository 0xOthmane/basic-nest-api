import {
  cleanDatabase,
  setupTestDb,
  teardownTestDb,
  TestContext,
} from 'src/utils/test/setup-db';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { buildFixtures } from 'src/utils/test/test-fixtures';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let ctx: TestContext;
  let controller: UsersController;
  let service: UsersService;
  let prisma: PrismaService;
  let fixtures: ReturnType<typeof buildFixtures>;

  beforeAll(async () => {
    ctx = await setupTestDb();
    controller = ctx.module.get(UsersController);
    service = ctx.module.get(UsersService);
    prisma = ctx.prisma;
    fixtures = buildFixtures(ctx.module);
  });

  afterAll(() => teardownTestDb(ctx));

  beforeEach(() => cleanDatabase(prisma));

  describe('create', () => {
    it('should create a user', async () => {
      const user = await controller.create({
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
      });

      expect(user).toHaveProperty('id');
      expect(user.email).toBe('john.doe@example.com');
      expect(user.firstname).toBe('John');
    });
  });

  describe('findAll', () => {
    it('should find all users', async () => {
      await fixtures.user({
        email: 'user1@test.com',
        firstname: 'User',
        lastname: 'One',
      });
      await fixtures.user({
        email: 'user2@test.com',
        firstname: 'User',
        lastname: 'Two',
      });

      const users = await controller.findAll();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('findOne', () => {
    it('should find a user by id', async () => {
      const created = await fixtures.user();
      const user = await controller.findOne(String(created.id));

      expect(user).toBeDefined();
      expect(user.id).toBe(created.id);
      expect(user.email).toBe(created.email);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const created = await fixtures.user();

      const updatedUser = await controller.update(String(created.id), {
        firstname: 'Jane',
        lastname: 'Smith',
        email: 'jane.smith@example.com',
      });

      expect(updatedUser).toMatchObject({
        id: created.id,
        firstname: 'Jane',
        lastname: 'Smith',
        email: 'jane.smith@example.com',
      });
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const created = await fixtures.user();
      await controller.remove(String(created.id));

      await expect(service.findOne(created.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAllPaginated', () => {
    it('should find all users paginated', async () => {
      for (let i = 0; i < 15; i++) {
        await fixtures.user({
          email: `user${i}@test.com`,
          firstname: `User`,
          lastname: `${i}`,
        });
      }

      const result = await controller.findAllPaginated({
        page: 1,
        limit: 10,
        skip: 0,
      });

      expect(result.data).toBeDefined();
      expect(result.meta).toBeDefined();
      expect(result.meta.total).toBeGreaterThanOrEqual(15);
      expect(result.meta.page).toBe(1);
    });
  });

  describe('findAllCursor', () => {
    it('should find all users with cursor pagination', async () => {
      const user1 = await fixtures.user({
        email: 'cursor1@test.com',
      });
      await fixtures.user({
        email: 'cursor2@test.com',
      });
      await fixtures.user({
        email: 'cursor3@test.com',
      });

      const result = await controller.findAllCursor({
        cursor: user1.id,
        limit: 10,
      });

      expect(result.data).toBeDefined();
      expect(result.meta).toBeDefined();
      expect(result.meta.nextCursor).toBeDefined();
    });
  });
});
