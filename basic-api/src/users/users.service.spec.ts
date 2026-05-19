import {
  cleanDatabase,
  setupTestDb,
  teardownTestDb,
  TestContext,
} from 'src/utils/test/setup-db';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildFixtures } from 'src/utils/test/test-fixtures';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { User } from 'src/generated/prisma/client';

describe('UsersService', () => {
  let ctx: TestContext;
  let service: UsersService;
  let prisma: PrismaService;
  let fixtures: ReturnType<typeof buildFixtures>;

  beforeAll(async () => {
    ctx = await setupTestDb();
    service = ctx.module.get(UsersService);
    prisma = ctx.prisma;
    fixtures = buildFixtures(ctx.module);
  });

  afterAll(() => teardownTestDb(ctx));

  beforeEach(() => cleanDatabase(prisma));

  describe('create', () => {
    it('should create a user', async () => {
      const user = await service.create({
        email: 'john.doe@example.com',
        name: 'John Doe',
      });

      expect(user).toHaveProperty('id');
      expect(user.email).toBe('john.doe@example.com');
      expect(user.name).toBe('John Doe');
    });

    it('should not allow duplicate emails', async () => {
      await fixtures.user();
      await expect(
        service.create({
          email: 'alice@test.com',
          name: 'Alice Smith',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      await fixtures.user({ email: 'alice2@test.com', name: 'Alice Smith' });
      await fixtures.user({ email: 'bob@test.com', name: 'Bob Johnson' });

      const users = await service.findAll();
      expect(users).toHaveLength(2);
    });
    it('should return an empty array if no users exist', async () => {
      const users = await service.findAll();
      expect(users).toEqual([]);
    });
    it('should return paginated results', async () => {
      for (let i = 0; i < 15; i++) {
        await fixtures.user({
          email: `user${i}@test.com`,
          name: `User ${i} Last Name ${i}`,
        });
      }

      const users = await service.findAllPaginated({ page: 2, limit: 5, skip: 0 });
      expect(users.data).toHaveLength(5);
      expect(users.meta).toEqual({
        total: 15,
        page: 2,
        lastPage: 3,
      });
    });
    it('should return cursor paginated results', async () => {
      const createdUsers: User[] = [];
      for (let i = 0; i < 15; i++) {
        const user = await fixtures.user({
          email: `user${i}@test.com`,
          name: `User ${i} Last Name ${i}`,
        });
        createdUsers.push(user);
      }

      const users = await service.findAllCursor({
        cursor: createdUsers[0].id,
        limit: 5,
      });
      expect(users.data).toHaveLength(5);
      expect(users.meta.nextCursor).toBeDefined();
    });
  });
  describe('findOne', () => {
    it('should return a user by ID', async () => {
      const created = await fixtures.user({
        email: 'john.doe@example.com',
        name: 'John Doe',
      });

      const user = await service.findOne(created.id);
      expect(user.id).toBe(created.id);
      expect(user.email).toBe(created.email);
      expect(user.name).toBe(created.name);
    });
  });
  describe('update', () => {
    it('should update a user', async () => {
      const created = await fixtures.user({ email: 'john.doe@example.com', name: 'John Doe' });

      const updated = await service.update(created.id, {
        email: 'john.updated@example.com',
        name: 'John Updated',
      });

      expect(updated).toMatchObject({
        id: created.id,
        email: 'john.updated@example.com',
        name: 'John Updated',
      });
    });
    it('should not allow updating to an existing email', async () => {
      const user1 = await fixtures.user({ email: 'alice@test.com', name: 'Alice Smith' });
      const user2 = await fixtures.user({ email: 'bob@test.com', name: 'Bob Johnson' });

      await expect(
        service.update(user2.id, {
          email: 'alice@test.com',
          name: 'Bob Updated',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
  describe('remove', () => {
    it('should remove a user', async () => {
      const created = await fixtures.user({ email: 'john.doe@example.com', name: 'John Doe' });

      await service.remove(created.id);
      await expect(service.findOne(created.id)).rejects.toThrow(
        NotFoundException,
      );
    });
    it('should do nothing if user does not exist', async () => {
      await expect(service.remove("999")).rejects.toThrow(NotFoundException);
    });
  });
});