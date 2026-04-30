import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  @Length(1, 1000, { message: 'Content must be between 1 and 1000 characters' })
  content: string;
}
