import { execSync } from 'child_process';
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { TestingModule, Test } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsersModule } from '../../users/users.module';
import { PostsModule } from '../../posts/posts.module';
import { CommentsModule } from '../../comments/comments.module';

jest.setTimeout(60000);

/**
 * Starts a real PostgreSQL container via Testcontainers, runs all migrations,
 * and returns a fully wired NestJS testing module.
 *
 * Why no mocks?
 * Business rules like ConflictException (duplicate email) or unique constraints
 * only surface at the database level. A mocked repository returns whatever you
 * tell it to — it can never catch the case where the constraint was accidentally
 * removed from the schema. Testing against a real DB gives you the actual behaviour.
 *
 * Call teardownTestDb() in afterAll to stop the container.
 */

export interface TestContext {
  module: TestingModule;
  prisma: PrismaService;
  container: StartedPostgreSqlContainer;
}

export async function setupTestDb(): Promise<TestContext> {
  const container = await new PostgreSqlContainer('postgres:18-alpine')
    .withDatabase('test')
    .withUsername('test')
    .withPassword('test')
    .start();

  const url = container.getConnectionUri();

  // Set DATABASE_URL before the NestJS module boots so PrismaService picks it up
  process.env.DATABASE_URL = url;

  // Run all migrations against the fresh container
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'pipe',
  });

  const module = await Test.createTestingModule({
    imports: [PrismaModule, UsersModule, PostsModule, CommentsModule],
  }).compile();

  const prisma = module.get<PrismaService>(PrismaService);

  return { module, prisma, container };
}

export async function teardownTestDb(ctx: TestContext): Promise<void> {
  if (!ctx) {
    return;
  }
  await ctx.module.close();
  await ctx.container.stop();
}

/**
 * Truncates all domain tables between tests to guarantee isolation.
 * Order matters — respect FK constraints.
 */
export async function cleanDatabase(prisma: PrismaService): Promise<void> {
  await prisma.$transaction([
    prisma.comment.deleteMany(),
    prisma.post.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}
