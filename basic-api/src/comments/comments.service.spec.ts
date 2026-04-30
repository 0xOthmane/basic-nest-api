import {
  cleanDatabase,
  setupTestDb,
  teardownTestDb,
  TestContext,
} from 'src/utils/test/setup-db';
import { CommentsService } from './comments.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { buildFixtures } from 'src/utils/test/test-fixtures';

describe('CommentsService', () => {
  let ctx: TestContext;
  let service: CommentsService;
  let prisma: PrismaService;
  let fixtures: ReturnType<typeof buildFixtures>;

  beforeAll(async () => {
    ctx = await setupTestDb();
    service = ctx.module.get(CommentsService);
    prisma = ctx.prisma;
    fixtures = buildFixtures(ctx.module);
  });

  afterAll(() => teardownTestDb(ctx));

  beforeEach(() => cleanDatabase(prisma));

  describe('create', () => {
    it('should create a comment', async () => {
      const user = await fixtures.user();
      const post = await fixtures.post(user.id);

      const comment = await service.create(
        {
          content: 'Great post!',
        },
        post.id,
        user.id,
      );

      expect(comment).toHaveProperty('id');
      expect(comment.content).toBe('Great post!');
      expect(comment.authorId).toBe(user.id);
      expect(comment.postId).toBe(post.id);
    });
  });

  describe('findAll', () => {
    it('should return all comments', async () => {
      const user = await fixtures.user();
      const post = await fixtures.post(user.id);
      await fixtures.comment(post.id, user.id);
      await fixtures.comment(post.id, user.id);

      const comments = await service.findAll();
      expect(comments.length).toBeGreaterThanOrEqual(2);
    });

    it('should return an empty array if no comments exist', async () => {
      const comments = await service.findAll();
      expect(comments).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a comment by ID', async () => {
      const user = await fixtures.user();
      const post = await fixtures.post(user.id);
      const created = await fixtures.comment(post.id, user.id, {
        content: 'Test comment',
      });

      const comment = await service.findOne(created.id);
      if (!comment) {
        throw new Error('Expected comment to be found');
      }
      expect(comment.id).toBe(created.id);
      expect(comment.content).toBe('Test comment');
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      const user = await fixtures.user();
      const post = await fixtures.post(user.id);
      const created = await fixtures.comment(post.id, user.id);

      const updated = await service.update(created.id, {
        content: 'Updated comment',
      });

      expect(updated).toMatchObject({
        id: created.id,
        content: 'Updated comment',
      });
    });
  });

  describe('remove', () => {
    it('should remove a comment', async () => {
      const user = await fixtures.user();
      const post = await fixtures.post(user.id);
      const created = await fixtures.comment(post.id, user.id);

      await service.remove(created.id);
      const comment = await prisma.comment.findUnique({
        where: { id: created.id },
      });
      expect(comment).toBeNull();
    });
  });
});
