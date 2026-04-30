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
        firstname: 'John',
        lastname: 'Doe',
        password: 'securepassword',
      });

      expect(user).toHaveProperty('id');
      expect(user.email).toBe('john.doe@example.com');
      expect(user.firstname).toBe('John');
      expect(user.lastname).toBe('Doe');
    });

    it('should not allow duplicate emails', async () => {
      await fixtures.user();
      await expect(
        service.create({
          email: 'alice@test.com',
          firstname: 'Alice',
          lastname: 'Smith',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      await fixtures.user({
        email: 'alice2@test.com',
        firstname: 'Alice',
        lastname: 'Smith',
        password: 'password123',
      });
      await fixtures.user({
        email: 'bob@test.com',
        firstname: 'Bob',
        lastname: 'Johnson',
        password: 'password456',
      });

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
          firstname: `User ${i}`,
          lastname: `Last Name ${i}`,
          password: 'password123',
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
          firstname: `User ${i}`,
          lastname: `Last Name ${i}`,
          password: 'password123',
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
        firstname: 'John',
        lastname: 'Doe',
        password: 'securepassword',
      });

      const user = await service.findOne(created.id);
      expect(user.id).toBe(created.id);
      expect(user.email).toBe(created.email);
      expect(user.firstname).toBe(created.firstname);
      expect(user.lastname).toBe(created.lastname);
    });
  });
  describe('update', () => {
    it('should update a user', async () => {
      const created = await fixtures.user({
        email: 'john.doe@example.com',
        firstname: 'John',
        lastname: 'Doe',
        password: 'securepassword',
      });

      const updated = await service.update(created.id, {
        email: 'john.updated@example.com',
        firstname: 'John',
        lastname: 'Updated',
        password: 'newsecurepassword',
      });

      expect(updated).toMatchObject({
        id: created.id,
        email: 'john.updated@example.com',
        firstname: 'John',
        lastname: 'Updated',
        password: 'newsecurepassword',
      });
    });
    it('should not allow updating to an existing email', async () => {
      const user1 = await fixtures.user({
        email: 'alice@test.com',
        firstname: 'Alice',
        lastname: 'Smith',
        password: 'password123',
      });
      const user2 = await fixtures.user({
        email: 'bob@test.com',
        firstname: 'Bob',
        lastname: 'Johnson',
        password: 'password456',
      });

      await expect(
        service.update(user2.id, {
          email: 'alice@test.com',
          firstname: 'Bob',
          lastname: 'Updated',
          password: 'newpassword',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
  describe('remove', () => {
    it('should remove a user', async () => {
      const created = await fixtures.user({
        email: 'john.doe@example.com',
        firstname: 'John',
        lastname: 'Doe',
        password: 'securepassword',
      });

      await service.remove(created.id);
      await expect(service.findOne(created.id)).rejects.toThrow(
        NotFoundException,
      );
    });
    it('should do nothing if user does not exist', async () => {
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});