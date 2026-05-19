import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UserResponseDto extends PartialType(
  PickType(CreateUserDto, ['name', 'email'] as const),
) {}
