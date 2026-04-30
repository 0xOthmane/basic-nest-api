import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  CursorPipe,
  type CursorQueryParams,
} from 'src/common/pipes/cursor.pipe';
import {
  PaginationPipe,
  type PaginationQueryParams,
} from 'src/common/pipes/pagination.pipe';
import { DeleteRoute } from 'src/common/decorators/delete-route.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get('paginated')
  async findAllPaginated(@Query(PaginationPipe) params: PaginationQueryParams) {
    return await this.usersService.findAllPaginated(params);
  }

  @Get('cursor')
  async findAllCursor(@Query(CursorPipe) params: CursorQueryParams) {
    return await this.usersService.findAllCursor(params);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(+id, updateUserDto);
  }

  @DeleteRoute()
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(+id);
  }
}
