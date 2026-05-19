import { Expose } from 'class-transformer';

export class CreateUserResponseDto {
  @Expose()
  name: string;
  @Expose()
  email: string;

  @Expose()
  get fullname(): string {
    return this.name;
  }
}
