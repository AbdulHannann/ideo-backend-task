export interface IUserResponseWithJwt {
  data: ICreateUserData;
  message: string;
  statusCode?: number;
}
export interface ICreateUserData {
  user: IUser;
  jwt: string;
}
export interface IUser {
  id: number;
  username: string;
  email: string;
}

export interface IAllUserResponse {
  data: IUser[];
  message: string;
  statusCode?: number;
}

export interface IUserResponseWithId {
  data: IUser;
  message: string;
  statusCode?: number;
}
