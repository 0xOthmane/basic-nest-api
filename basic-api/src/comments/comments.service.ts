import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Logger } from '@nestjs/common';

const logger = new Logger('CommentsService');

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}
  create(createCommentDto: CreateCommentDto, postId: string, authorId: string) {
    try {
      return this.prisma.comment.create({
        data: {
          ...createCommentDto,
          authorId,
          postId,
        },
      });
    } catch (error) {
      logger.error('Failed to create comment', error);
      throw new Error('Failed to create comment');
    }
  }

  findAll() {
    return this.prisma.comment.findMany({
      select: {
        id: true,
        content: true,
        author: {
          include: {
            profile: {
              select: {
                firstname: true,
                lastname: true,
              },
            },
          },
        },
      },
    });
  }
  findOne(id: string) {
    return this.prisma.comment.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        content: true,
        author: {
          include: {
            profile: {
              select: {
                firstname: true,
                lastname: true,
              },
            },
          },
        },
      },
    });
  }

  update(id: string, updateCommentDto: UpdateCommentDto) {
    return this.prisma.comment.update({
      where: {
        id,
      },
      data: updateCommentDto,
    });
  }

  remove(id: string) {
    return this.prisma.comment.delete({
      where: {
        id,
      },
    });
  }
}
