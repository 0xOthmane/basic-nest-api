import { TestingModule } from '@nestjs/testing';
import { type UserSession } from '@thallesp/nestjs-better-auth';
import { CommentsService } from 'src/comments/comments.service';
import { PostsService } from 'src/posts/posts.service';
import { UsersService } from 'src/users/users.service';

export function buildFixtures(module: TestingModule) {
  const usersService = module.get(UsersService);
  const postsService = module.get(PostsService);
  const commentsService = module.get(CommentsService);

  type CreatedUser = Awaited<ReturnType<typeof usersService.create>>;

  return {
    user(override?: { email?: string; name?: string; password?: string }) {
      return usersService.create({
        email: override?.email ?? 'alice@test.com',
        name: override?.name ?? 'Alice Smith',
      });
    },

    session(user: CreatedUser): UserSession {
      const now = new Date();

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        session: {
          id: 'session-id',
          userId: user.id,
          token: 'session-token',
          expiresAt: now,
        },
      } as UserSession;
    },

    post(userId: string, override?: { title?: string; content?: string }) {
      return postsService.create(
        {
          title: override?.title ?? 'My first post',
          content: override?.content ?? 'Hello world!',
        },
        userId,
      );
    },
    comment(postId: string, authorId: string, override?: { content?: string }) {
      return commentsService.create(
        {
          content: override?.content ?? 'Great post!',
        },
        postId,
        authorId,
      );
    },
  };
}
