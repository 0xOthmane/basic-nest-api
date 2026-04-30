import { TestingModule } from '@nestjs/testing';
import { CommentsService } from 'src/comments/comments.service';
import { PostsService } from 'src/posts/posts.service';
import { UsersService } from 'src/users/users.service';

export function buildFixtures(module: TestingModule) {
  const usersService = module.get(UsersService);
  const postsService = module.get(PostsService);
  const commentsService = module.get(CommentsService);

  return {
    user(override?: {
      email?: string;
      firstname?: string;
      lastname?: string;
      password?: string;
    }) {
      return usersService.create({
        email: override?.email ?? 'alice@test.com',
        firstname: override?.firstname ?? 'Alice',
        lastname: override?.lastname ?? 'Smith',
        password: override?.password ?? 'password123',
      });
    },

    post(userId: number, override?: { title?: string; content?: string }) {
      return postsService.create(
        {
          title: override?.title ?? 'My first post',
          content: override?.content ?? 'Hello world!',
        },
        userId,
      );
    },
    comment(postId: string, authorId: number, override?: { content?: string }) {
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
