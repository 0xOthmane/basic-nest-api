import {
  cleanDatabase,
  setupTestDb,
  teardownTestDb,
  TestContext,
} from 'src/utils/test/setup-db';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { buildFixtures } from 'src/utils/test/test-fixtures';
import { PrismaService } from 'src/prisma/prisma.service';

describe('CommentsController', () => {
  let ctx: TestContext;
  let controller: CommentsController;
  let service: CommentsService;
  let prisma: PrismaService;
  let fixtures: ReturnType<typeof buildFixtures>;

  beforeAll(async () => {
    ctx = await setupTestDb();
    controller = ctx.module.get(CommentsController);
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

      const comment = await controller.create(
        {
          content: 'Great post!',
        },
        post.id,
        user.id,
      );

      expect(comment).toHaveProperty('id');
      expect(comment.content).toBe('Great post!');
    });
  });

  describe('findAll', () => {
    it('should find all comments', async () => {
      const user = await fixtures.user();
      const post = await fixtures.post(user.id);
      await fixtures.comment(post.id, user.id);

      const comments = await controller.findAll();
      expect(Array.isArray(comments)).toBe(true);
      expect(comments.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('findOne', () => {
    it('should find a comment by id', async () => {
      const user = await fixtures.user();
      const post = await fixtures.post(user.id);
      const created = await fixtures.comment(post.id, user.id);

      const comment = await controller.findOne(created.id);
      if (!comment) {
        throw new Error('Expected comment to be found');
      }
      expect(comment.id).toBe(created.id);
    });
  });

  describe('update', () => {
    it('should update a comment', async () => {
      const user = await fixtures.user();
      const post = await fixtures.post(user.id);
      const created = await fixtures.comment(post.id, user.id);

      const updated = await controller.update(created.id, {
        content: 'Updated comment content',
      });

      expect(updated).toMatchObject({
        id: created.id,
        content: 'Updated comment content',
      });
    });
  });

  describe('remove', () => {
    it('should remove a comment', async () => {
      const user = await fixtures.user();
      const post = await fixtures.post(user.id);
      const created = await fixtures.comment(post.id, user.id);

      await controller.remove(created.id);
      const comment = await prisma.comment.findUnique({
        where: { id: created.id },
      });
      expect(comment).toBeNull();
    });
  });
});
