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

  findAll() {
    return this.prisma.user.findMany();
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

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
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
