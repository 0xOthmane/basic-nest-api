import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './lib/auth';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    PostsModule,
    CommentsModule,
    AuthModule.forRoot({
      auth,
      bodyParser: {
        json: {
          limit: '2mb',
        },
        urlencoded: {
          enabled: true,
          extended: true,
          limit: '2mb',
        },
        rawBody: true,
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
