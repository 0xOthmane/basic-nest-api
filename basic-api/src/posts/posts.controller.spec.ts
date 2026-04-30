import {
  cleanDatabase,
  setupTestDb,
  teardownTestDb,
  TestContext,
} from 'src/utils/test/setup-db';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { buildFixtures } from 'src/utils/test/test-fixtures';
import { PrismaService } from 'src/prisma/prisma.service';

describe('PostsController', () => {
  let ctx: TestContext;
  let controller: PostsController;
  let service: PostsService;
  let prisma: PrismaService;
  let fixtures: ReturnType<typeof buildFixtures>;

  beforeAll(async () => {
    ctx = await setupTestDb();
    controller = ctx.module.get(PostsController);
    service = ctx.module.get(PostsService);
    prisma = ctx.prisma;
    fixtures = buildFixtures(ctx.module);
  });

  afterAll(() => teardownTestDb(ctx));

  beforeEach(() => cleanDatabase(prisma));

  describe('create', () => {
    it('should create a post', async () => {
      await fixtures.user();

      const post = await controller.create({
        title: 'Test Post',
        content: 'This is a test post',
      });

      expect(post).toHaveProperty('id');
      expect(post.title).toBe('Test Post');
    });
  });

  describe('findAll', () => {
    it('should find all posts', async () => {
      const user = await fixtures.user();
      await fixtures.post(user.id);
      await fixtures.post(user.id);

      const posts = await controller.findAll();
      expect(Array.isArray(posts)).toBe(true);
      expect(posts.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('findOne', () => {
    it('should find a post by id', async () => {
      const user = await fixtures.user();
      const created = await fixtures.post(user.id);

      const post = await controller.findOne(created.id);
      if (!post) {
        throw new Error('Expected post to be found');
      }
      expect(post.id).toBe(created.id);
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const user = await fixtures.user();
      const created = await fixtures.post(user.id);

      const updated = await controller.update(created.id, {
        title: 'Updated Title',
        content: 'Updated Content',
      });

      expect(updated).toMatchObject({
        id: created.id,
        title: 'Updated Title',
      });
    });
  });

  describe('remove', () => {
    it('should remove a post', async () => {
      const user = await fixtures.user();
      const created = await fixtures.post(user.id);

      await controller.remove(created.id);
      const post = await prisma.post.findUnique({
        where: { id: created.id },
      });
      expect(post).toBeNull();
    });
  });
});
