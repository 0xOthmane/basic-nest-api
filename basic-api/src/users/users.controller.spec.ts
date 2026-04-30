import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should create a user', async () => {
    const user = await controller.create({
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      password: 'password123',
    });
    expect(user).toBeDefined();
  });
  it('should find all users', async () => {
    const users = await controller.findAll();
    expect(users).toBeDefined();
  });
  it('should find a user by id', async () => {
    const user = await controller.findOne('1');
    expect(user).toBeDefined();
  });
  it('should update a user', async () => {
    const updatedUser = await controller.update('1', {
      firstname: 'Jane',
      lastname: 'Doe',
      email: 'jane.doe@example.com',
    });
    expect(updatedUser).toBeDefined();
  });
  it('should remove a user', async () => {
    const result = await controller.remove('1');
    expect(result).toBeUndefined();
  });
  it('should find all users paginated', async () => {
    const result = await controller.findAllPaginated({
      page: 1,
      limit: 10,
      skip: 0,
    });
    expect(result).toBeDefined();
  });
  it('should find all users with cursor pagination', async () => {
    const result = await controller.findAllCursor({ limit: 10 });
    expect(result).toBeDefined();
  });
});
