import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}
  create(createCommentDto: CreateCommentDto) {
    try {
      const userId = 1; // Replace with actual user ID from authentication context
      const postId = '1';
      return this.prisma.comment.create({
        data: {
          ...createCommentDto,
          authorId: userId,
          postId,
        },
      });
    } catch (error) {
      throw new Error('Failed to create comment');
    }
  }

  findAll() {
    return this.prisma.comment.findMany({
      select: {
        id: true,
        content: true,
        author: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
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
          select: {
            id: true,
            firstname: true,
            lastname: true,
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
