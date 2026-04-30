import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}
  async create(createPostDto: CreatePostDto, authorId: number) {
    const post = await this.prisma.post.create({
      data: { ...createPostDto, authorId },
    });
    return post;
  }

  findAll() {
    return this.prisma.post.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        author: {
          select: {
            id: true,
            firstname: true,
            lastname: true,
          },
        },
        published: true,
        createdAt: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.post.findUnique({
      where: { id },
    });
  }

  update(id: string, updatePostDto: UpdatePostDto) {
    return this.prisma.post.update({
      where: { id },
      data: { ...updatePostDto },
    });
  }

  remove(id: string) {
    return this.prisma.post.delete({
      where: { id },
    });
  }
}
