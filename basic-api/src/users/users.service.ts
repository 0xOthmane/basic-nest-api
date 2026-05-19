import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { UserResponseDto } from './dto/delete-user-response.dto';
import { CursorQueryParams } from 'src/common/pipes/cursor.pipe';
import { PaginationQueryParams } from 'src/common/pipes/pagination.pipe';
import { plainToInstance } from 'class-transformer';
import { CreateUserResponseDto } from './dto/create-user-response.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const { name, email } = createUserDto;
      const user = await this.prisma.user.create({
        data: { name, email },
      });
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `User with email ${createUserDto.email} already exists`,
          );
        }
      }
      throw error;
    }
  }

  async findAll() {
    return await this.prisma.user.findMany();
  }

  async findAllPaginated(params: PaginationQueryParams) {
    const { page, limit } = params;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          name: true,
          email: true,
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findAllCursor(params: CursorQueryParams) {
    const { cursor, limit } = params;
    const users = await this.prisma.user.findMany({
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const nextCursor = users.length ? users[users.length - 1].id : null;

    return {
      data: users,
      meta: {
        nextCursor,
      },
    };
  }

  async findOne(id: string) {
    const idStr = String(id);
    const user = await this.prisma.user.findUnique({
      where: { id: idStr },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    // const dto = plainToInstance(CreateUserResponseDto, user);
    return plainToInstance(CreateUserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const idStr = String(id);
      return await this.prisma.user.update({
        where: { id: idStr },
        data: { ...updateUserDto },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(
            `User with email ${updateUserDto.email} already exists`,
          );
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<UserResponseDto> {
    const idStr = String(id);
    const user = await this.findOne(idStr);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const deletedUser = (await this.prisma.user.delete({
      where: { id: idStr },
      select: {
        id: true,
        name: true,
        email: true,
      },
    })) as UserResponseDto;
    return deletedUser;
  }
}
