import * as dotenv from 'dotenv';
dotenv.config();
import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: 'postgres',
  logging: false,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/src/migrations/**/*.{js,ts}'],
  synchronize: false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
