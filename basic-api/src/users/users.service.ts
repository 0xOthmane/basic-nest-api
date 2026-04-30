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
import { CreateUserResponseDto } from './dto/create-user-response.dto';
import { plainToInstance } from 'class-transformer';
import { CursorQueryParams } from 'src/common/pipes/cursor.pipe';
import { PaginationQueryParams } from 'src/common/pipes/pagination.pipe';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const user = await this.prisma.user.create({
        data: { ...createUserDto },
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
        orderBy: { id: 'asc' },
        select: {
          id: true,
          firstname: true,
          lastname: true,
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
      orderBy: { id: 'asc' },
      select: {
        id: true,
        firstname: true,
        lastname: true,
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

  async findOne(id: number): Promise<CreateUserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const dto = plainToInstance(CreateUserResponseDto, user);
    console.log(dto.fullname);
    return plainToInstance(CreateUserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
  async getUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return await this.prisma.user.update({
      where: { id },
      data: { ...updateUserDto },
    });
  }

  async remove(id: number): Promise<UserResponseDto> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const deletedUser = (await this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
      },
    })) as UserResponseDto;
    return deletedUser;
  }
}
