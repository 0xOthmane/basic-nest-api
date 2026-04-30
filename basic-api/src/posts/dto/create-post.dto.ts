import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 255, { message: 'Title must be between 2 and 255 characters' })
  title: string;

  @IsNotEmpty()
  @IsString()
  @Length(5, 5000, { message: 'Content must be between 5 and 5000 characters' })
  content: string;
}
