import { Exclude, Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @Transform(({ value }: { value: string }) => value.trim().toLowerCase())
  @IsString()
  @IsNotEmpty()
  @MaxLength(50, { message: 'Firstname must be at most 50 characters' })
  @MinLength(2, { message: 'Firstname must be at least 2 characters' })
  readonly firstname: string;

  @Transform(({ value }: { value: string }) => value.trim().toLowerCase())
  @IsString()
  @IsNotEmpty()
  @MaxLength(50, { message: 'Firstname must be at most 50 characters' })
  @MinLength(2, { message: 'Firstname must be at least 2 characters' })
  readonly lastname: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255, { message: 'Password must be at most 255 characters' })
  @MinLength(12, { message: 'Password must be at least 12 characters' })
  @Exclude()
  readonly password: string;

  @Transform(({ value }: { value: string }) => value.trim().toLowerCase())
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty()
  readonly email: string;
}
