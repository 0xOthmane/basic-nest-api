import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('paginated')
  findAllPaginated(@Query(PaginationPipe) params: PaginationQueryParams) {
    return this.usersService.findAllPaginated(params);
  }

  @Get('cursor')
  findAllCursor(@Query(CursorPipe) params: CursorQueryParams) {
    return this.usersService.findAllCursor(params);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
