import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from './../core/guard/jwt-guard';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  IAllUserResponse,
  IUserResponseWithId,
  IUserResponseWithJwt,
} from 'src/core/interface/user-service-interface';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/register')
  create(@Body() createUserDto: CreateUserDto): Promise<IUserResponseWithJwt> {
    return this.userService.create(createUserDto);
  }

  @Post('/login')
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  login(@Body() loginUserDto: LoginUserDto): Promise<IUserResponseWithJwt> {
    return this.userService.login(loginUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  findAll(): Promise<IAllUserResponse> {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string): Promise<IUserResponseWithId> {
    return this.userService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<IUserResponseWithId> {
    return this.userService.update(+id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string): Promise<IUserResponseWithId> {
    return this.userService.remove(+id);
  }
}
