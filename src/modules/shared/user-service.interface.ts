import { User } from '../user-service/schemas/index';

export interface UserServiceInterface {
  findByUsername(username: string): Promise<User | null>;
  createUser(createUserDto: any): Promise<User>;
}
