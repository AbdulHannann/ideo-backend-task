import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'ormconfig';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forRoot(dataSourceOptions), UserModule],
  controllers: [AppController],
  providers: [AppService, JwtService],
})
export class AppModule {}
