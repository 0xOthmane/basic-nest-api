import {
  cleanDatabase,
  setupTestDb,
  teardownTestDb,
  TestContext,
} from 'src/utils/test/setup-db';
import { PostsService } from './posts.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildFixtures } from 'src/utils/test/test-fixtures';

describe('PostsService', () => {
  let ctx: TestContext;
  let service: PostsService;
  let prisma: PrismaService;
  let fixtures: ReturnType<typeof buildFixtures>;

  beforeAll(async () => {
    ctx = await setupTestDb();
    service = ctx.module.get(PostsService);
    prisma = ctx.prisma;
    fixtures = buildFixtures(ctx.module);
  });

  afterAll(() => teardownTestDb(ctx));

  beforeEach(() => cleanDatabase(prisma));

  describe('create', () => {
    it('should create a post', async () => {
      const user = await fixtures.user();

      const post = await service.create(
        {
          title: 'Test Post',
          content: 'This is a test post',
        },
        user.id,
      );

      expect(post).toHaveProperty('id');
      expect(post.title).toBe('Test Post');
      expect(post.content).toBe('This is a test post');
      expect(post.authorId).toBe(user.id);
    });
  });

  describe('findAll', () => {
    it('should return all posts', async () => {
      const user = await fixtures.user();
      await fixtures.post(user.id, {
        title: 'Post 1',
        content: 'Content 1',
      });
      await fixtures.post(user.id, {
        title: 'Post 2',
        content: 'Content 2',
      });

      const posts = await service.findAll();
      expect(posts).toHaveLength(2);
    });

    it('should return an empty array if no posts exist', async () => {
      const posts = await service.findAll();
      expect(posts).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a post by ID', async () => {
      const user = await fixtures.user();
      const created = await fixtures.post(user.id, {
        title: 'Test Post',
        content: 'Test Content',
      });

      const post = await service.findOne(created.id);
      if (!post) {
        throw new Error('Expected post to be found');
      }
      expect(post.id).toBe(created.id);
      expect(post.title).toBe('Test Post');
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const user = await fixtures.user();
      const created = await fixtures.post(user.id, {
        title: 'Original Title',
        content: 'Original Content',
      });

      const updated = await service.update(created.id, {
        title: 'Updated Title',
        content: 'Updated Content',
      });

      expect(updated).toMatchObject({
        id: created.id,
        title: 'Updated Title',
        content: 'Updated Content',
      });
    });
  });

  describe('remove', () => {
    it('should remove a post', async () => {
      const user = await fixtures.user();
      const created = await fixtures.post(user.id, {
        title: 'Test Post',
        content: 'Test Content',
      });

      await service.remove(created.id);
      const post = await prisma.post.findUnique({
        where: { id: created.id },
      });
      expect(post).toBeNull();
    });
  });
});
