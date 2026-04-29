import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UserResponseDto extends PartialType(
  PickType(CreateUserDto, ['firstname', 'lastname', 'email'] as const),
) {}
