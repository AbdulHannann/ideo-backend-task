import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { comparePassword, hashPassword } from './../utils/common';
import { LoginUserDto } from './dto/login-user.dto';
import {
  IAllUserResponse,
  IUserResponseWithJwt,
  IUserResponseWithId,
} from 'src/core/interface/user-service-interface';
dotenv.config();

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<IUserResponseWithJwt> {
    try {
      const userExist = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });
      if (userExist) throw new NotFoundException('User already exist');
      createUserDto.password = await hashPassword(createUserDto.password);
      const { password, ...restUser } = createUserDto;
      const response = await this.userRepository.save(createUserDto);
      const jwt = this.jwtService.sign(restUser);
      if (response) {
        const { password, ...rest } = response;
        return {
          data: { user: rest, jwt: jwt },
          message: 'User created successfully',
        };
      }
      return null;
    } catch (error) {
      return {
        data: null,
        message: error.message,
        statusCode: error.status,
      };
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<IUserResponseWithJwt> {
    try {
      const user = await this.userRepository
        .createQueryBuilder('user')
        .where('user.email = :email', { email: loginUserDto.email })
        .addSelect('user.password')
        .getOne();
      if (!user) throw new NotFoundException('User not found');
      const isPasswordMatch = await comparePassword(
        loginUserDto.password,
        user.password,
      );
      if (!isPasswordMatch)
        throw new NotFoundException('email or password is invalid');
      const { password, ...rest } = user;
      const jwt = this.jwtService.sign(rest);
      if (user) {
        return {
          data: { user: rest, jwt: jwt },
          message: 'User logged in successfully',
        };
      }
      return null;
    } catch (error) {
      return {
        data: null,
        message: error.message,
        statusCode: error.status,
      };
    }
  }

  async findAll(): Promise<IAllUserResponse> {
    try {
      const user = await this.userRepository.find();
      if (!user) throw new NotFoundException('User not found');
      return { data: user, message: 'Users fetched successfully' };
    } catch (error) {
      return {
        data: null,
        message: error.message,
        statusCode: error.status,
      };
    }
  }

  async findOne(id: number): Promise<IUserResponseWithId> {
    try {
      const userById = await this.userRepository.findOne({ where: { id } });
      if (!userById) throw new NotFoundException('User not found');
      return { data: userById, message: 'User fetched successfully' };
    } catch (error) {
      return {
        data: null,
        message: error.message,
        statusCode: error.status,
      };
    }
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<IUserResponseWithId> {
    try {
      const findUser = await this.userRepository.findOne({ where: { id } });
      if (!findUser) throw new NotFoundException('User not found');
      const updateUser = await this.userRepository.update(id, updateUserDto);
      if (updateUser.affected) {
        const updatedUser = await this.userRepository.findOne({
          where: { id: id },
        });
        return { data: updatedUser, message: 'User updated successfully' };
      }
    } catch (error) {
      return {
        data: null,
        message: error.message,
        statusCode: error.status,
      };
    }
  }

  async remove(id: number): Promise<IUserResponseWithId> {
    try {
      const findUser = await this.userRepository.findOne({ where: { id } });
      if (!findUser) throw new NotFoundException('User not found');
      const deleteUser = await this.userRepository.delete(id);
      if (deleteUser.affected) {
        return { data: findUser, message: 'User deleted successfully' };
      }
      return null;
    } catch (error) {
      return {
        data: null,
        message: error.message,
        statusCode: error.status,
      };
    }
  }
}
