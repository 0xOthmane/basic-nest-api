import { Expose } from 'class-transformer';

export class CreateUserResponseDto {
  @Expose()
  firstname: string;
  @Expose()
  lastname: string;
  @Expose()
  email: string;

  @Expose()
  get fullname(): string {
    return `${this.firstname} ${this.lastname}`;
  }
}
