import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { validate } from 'class-validator';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn((userData: CreateUserDto) => userData),
            login: jest.fn((userData: LoginUserDto) => userData),
            findAll: jest.fn(() => []),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'token'),
          },
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });
  describe('create', () => {
    it('should create a new user ', async () => {
      const payload: CreateUserDto = {
        username: 'test',
        email: 'test@yopmail.com',
        password: 'Test@123',
      };
      const mockResponseUser = {
        id: 1,
        username: 'test',
        email: 'test@yopmail.com',
      };
      const token = jwtService.sign(mockResponseUser);
      expect(token).toBe('token');
      const mockResponse = {
        data: { user: mockResponseUser, jwt: 'token' },
        message: 'User created successfully',
      };
      jest.spyOn(userService, 'create').mockResolvedValue(mockResponse);
      const result = await userController.create(payload);
      expect(result).toEqual(mockResponse);
    });
    it('should throw an error if user already exists', async () => {
      const payload: CreateUserDto = {
        username: 'test',
        email: 'test@yopmail.com',
        password: 'Test@123',
      };

      const error = await validate(payload);
      jest.spyOn(userService, 'create').mockResolvedValue({
        data: null,
        message: 'User already exist',
        statusCode: 404,
      });
      const result = await userController.create(payload);
      expect(result).toEqual({
        data: null,
        message: 'User already exist',
        statusCode: 404,
      });
      // expect(dtoError).toBe(0);
    });
  });
  describe('login', () => {
    it('should retrun a user and jwt token ', async () => {
      const payload: LoginUserDto = {
        email: 'test@yopmail.com',
        password: 'Test@123',
      };
      const error = await validate(payload);
      const mockUser = {
        id: 1,
        username: 'test',
        ...payload,
      };
      jest.spyOn(userService, 'login').mockResolvedValue({
        data: { user: mockUser, jwt: 'token' },
        message: 'User logged in successfully',
      });
      const result = await userController.login(payload);
      expect(result).toEqual({
        data: { user: mockUser, jwt: 'token' },
        message: 'User logged in successfully',
      });
    });
    it('should throw an error if user already exists', async () => {
      const payload: LoginUserDto = {
        email: 'test@yopmail.com',
        password: 'Test@123',
      };
      const error = await validate(payload);
      jest.spyOn(userService, 'login').mockResolvedValue({
        data: null,
        message: 'User not found',
        statusCode: 404,
      });
      const result = await userController.login(payload);
      expect(result).toEqual({
        data: null,
        message: 'User not found',
        statusCode: 404,
      });
    });
  });
  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = {
        id: 1,
        username: 'test',
        email: 'test@yopmail.com',
      };
      jest.spyOn(userService, 'findAll').mockResolvedValue({
        data: [mockUsers],
        message: 'Users fetched successfully',
      });
      const result = await userController.findAll();
      expect(result).toEqual({
        data: [mockUsers],
        message: 'Users fetched successfully',
      });
    });

    it('should throw an error if user not found', async () => {
      jest.spyOn(userService, 'findAll').mockResolvedValue({
        data: null,
        message: 'Users not found',
        statusCode: 404,
      });
      const result = await userController.findAll();
      expect(result).toEqual({
        data: null,
        message: 'Users not found',
        statusCode: 404,
      });
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const mockUser = {
        id: 1,
        username: 'test',
        email: 'test@yopmail.com',
      };
      jest.spyOn(userService, 'findOne').mockResolvedValue({
        data: mockUser,
        message: 'User fetched successfully',
      });
      const result = await userController.findOne('1');
      expect(result).toEqual({
        data: mockUser,
        message: 'User fetched successfully',
      });
    });
    it('should throw an error if user not found', async () => {
      jest.spyOn(userService, 'findOne').mockResolvedValue({
        data: null,
        message: 'User not found',
        statusCode: 404,
      });
      const result = await userController.findOne('1');
      expect(result).toEqual({
        data: null,
        message: 'User not found',
        statusCode: 404,
      });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const mockUser = {
        id: 1,
        username: 'test',
        email: 'test@yopmail.com',
      };
      const updateUser: UpdateUserDto = {
        username: 'testUpdate',
      };
      jest.spyOn(userService, 'update').mockResolvedValue({
        data: mockUser,
        message: 'User updated successfully',
      });
      const result = await userController.update('1', updateUser);
      expect(result).toEqual({
        data: mockUser,
        message: 'User updated successfully',
      });
    });

    it('should throw an error if user not found', async () => {
      jest.spyOn(userService, 'update').mockResolvedValue({
        data: null,
        message: 'User not found',
        statusCode: 404,
      });
      const updateUser: UpdateUserDto = {
        username: 'testUpdate',
      };
      const result = await userController.update('1', updateUser);
      expect(result).toEqual({
        data: null,
        message: 'User not found',
        statusCode: 404,
      });
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const mockUser = {
        id: 1,
        username: 'test',
        email: 'test@yopmail.com',
      };
      jest.spyOn(userService, 'remove').mockResolvedValue({
        data: mockUser,
        message: 'User deleted successfully',
      });
      const result = await userController.remove('1');
      expect(result).toEqual({
        data: mockUser,
        message: 'User deleted successfully',
      });
    });

    it('should throw an error if user not found', async () => {
      jest.spyOn(userService, 'remove').mockResolvedValue({
        data: null,
        message: 'User not found',
        statusCode: 404,
      });
      const result = await userController.remove('1');
      expect(result).toEqual({
        data: null,
        message: 'User not found',
        statusCode: 404,
      });
    });
  });
});
