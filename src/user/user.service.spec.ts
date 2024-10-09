import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { JwtService } from '@nestjs/jwt';
import * as comparePasswordUtils from './../utils/common';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'token'),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            save: jest.fn((userData: CreateUserDto) => userData),
            login: jest.fn((loginData: LoginUserDto) => loginData),
            find: jest.fn(),
            findAll: jest.fn(() => []),
            findOne: jest.fn((id: number) => id),
            update: jest.fn(),
            delete: jest.fn(),
            comparePassword: jest.fn(() => true),
            createQueryBuilder: jest.fn().mockReturnValue(() => ({
              where: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              getOne: jest.fn().mockResolvedValue(null),
            })),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('create', () => {
    it('should create a user', async () => {
      const payload: CreateUserDto = {
        username: 'test',
        email: 'test@yopmail.com',
        password: 'Test@123',
      };
      const createUserDto: CreateUserDto = plainToInstance(
        CreateUserDto,
        payload,
      );
      const error = await validate(createUserDto);
      // Mock findOne to return undefined (no user exists with this email)
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      // Mock save method to return the user with an id
      const savedUser = { ...createUserDto, id: 1 };
      jest.spyOn(userRepository, 'save').mockResolvedValue(savedUser);

      const { password, ...restUser } = savedUser;
      // Mock jwtService.sign to return a token
      const token = jwtService.sign(restUser);
      expect(token).toBe('token');

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(
        await userRepository.findOne({
          where: { email: payload.email },
        }),
      );

      const user = await userService.create(payload);

      expect(user).toEqual({
        data: { user: restUser, jwt: 'token' },
        message: 'User created successfully',
      });
      expect(error.length).toBe(0);
    });

    it('should throw an error if user already exists', async () => {
      const payload: CreateUserDto = {
        username: 'test',
        email: 'test@yopmail.com',
        password: 'Test@123',
      };
      const existingUser = {
        ...payload,
        id: 1,
      };
      const createUserDto: CreateUserDto = plainToInstance(
        CreateUserDto,
        payload,
      );
      const error = await validate(createUserDto);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(existingUser);
      const result = await userService.create(payload);
      expect(result).toEqual({
        data: null,
        message: 'User already exist',
        statusCode: 404,
      });
      expect(error.length).toBe(0);
    });
  });
  describe('login', () => {
    it('should throw an error if user doesnt exists', async () => {
      const payload: LoginUserDto = {
        email: 'test@yopmail.com',
        password: 'Test@123',
      };
      const loginUserDto: LoginUserDto = plainToInstance(LoginUserDto, payload);
      const error = await validate(loginUserDto);
      jest.spyOn(userRepository, 'createQueryBuilder').mockImplementation(
        () =>
          ({
            where: jest.fn().mockReturnThis(),
            addSelect: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockResolvedValue(null),
          }) as any,
      );
      const result = await userService.login(loginUserDto);
      expect(result).toEqual({
        data: null,
        message: 'User not found',
        statusCode: 404,
      });
      expect(error.length).toBe(0);
    });

    it('should retrun a user and jwt token ', async () => {
      const payload: LoginUserDto = {
        email: 'test@yopmail.com',
        password: 'Test@123',
      };
      const loginUserDto: LoginUserDto = plainToInstance(LoginUserDto, payload);
      const error = await validate(loginUserDto);
      const mockUser = {
        id: 1,
        username: 'test',
        ...payload,
      };
      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue({
        where: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockUser),
      } as any);

      jest
        .spyOn(comparePasswordUtils, 'comparePassword')
        .mockResolvedValue(true);

      const { password, ...restUser } = mockUser;
      const token = jwtService.sign(restUser);
      expect(token).toBe('token');
      const result = await userService.login(payload);
      expect(result).toEqual({
        data: { user: restUser, jwt: 'token' },
        message: 'User logged in successfully',
      });
      expect(error.length).toBe(0);
    });
  });
  describe('findAll', () => {
    it('should return an error of user doesnt exists', async () => {
      jest.spyOn(userRepository, 'find').mockResolvedValue(null);
      const result = await userService.findAll();
      expect(result).toEqual({
        data: null,
        message: 'User not found',
        statusCode: 404,
      });
    });

    it('should retun an arry of users', async () => {
      const mockUsers = {
        id: 1,
        username: 'test',
        email: 'test@yopmail.com',
        password: 'Test@123',
      };

      jest.spyOn(userRepository, 'find').mockResolvedValue([mockUsers]);
      const result = await userService.findAll();
      expect(result).toEqual({
        data: [mockUsers],
        message: 'Users fetched successfully',
      });
    });
  });
  describe('findOne', () => {
    it('should return a user with an id', async () => {
      const mockUser = {
        id: 1,
        username: 'test',
        email: 'test@yopmail.com',
        password: 'Test@123',
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      const result = await userService.findOne(1);
      expect(result).toEqual({
        data: mockUser,
        message: 'User fetched successfully',
      });
    });

    it('should return an error of user doesnt exists', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      const result = await userService.findOne(1);
      expect(result).toEqual({
        data: null,
        message: 'User not found',
        statusCode: 404,
      });
    });
  });
  describe('update', () => {
    it('should throw an error of user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      const updateUser: UpdateUserDto = {
        username: 'test',
      };
      const result = await userService.update(1, updateUser);
      expect(result).toEqual({
        data: null,
        message: 'User not found',
        statusCode: 404,
      });
    });

    it('should return an updated user', async () => {
      const mockUser = {
        id: 1,
        username: 'test',
        email: 'test@yopmail.com',
        password: 'Test@123',
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      const updateUser: UpdateUserDto = {
        username: 'testUpdate',
      };
      const updatedMockUser = {
        id: 1,
        username: 'testUpdate',
        email: 'test@yopmail.com',
        password: 'Test@123',
      };
      jest
        .spyOn(userRepository, 'update')
        .mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(updatedMockUser);
      await userService.update(1, updateUser);
      const result = await userService.findOne(1);
      expect(result).toEqual({
        data: updatedMockUser,
        message: 'User fetched successfully',
      });
    });
  });
  describe('remove', () => {
    it('should throw an error of user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      const result = await userService.remove(1);
      expect(result).toEqual({
        data: null,
        message: 'User not found',
        statusCode: 404,
      });
    });

    it('should return an deleted user', async () => {
      const mockUser = {
        id: 1,
        username: 'test',
        email: 'test@yopmail.com',
        password: 'Test@123',
      };
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest
        .spyOn(userRepository, 'delete')
        .mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] } as any);
      const result = await userService.remove(1);
      expect(result).toEqual({
        data: mockUser,
        message: 'User deleted successfully',
      });
    });
  });
});
