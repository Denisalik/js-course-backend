import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private userRepo: typeof User) {}

  async create(dto: CreateUserDto) {
    return await this.userRepo.create(dto);
  }

  async findAll() {
    return await this.userRepo.findAll();
  }

  async findOne(id: number) {
    return await this.userRepo.findByPk(id);
  }

  async update(id: number, dto: CreateUserDto) {
    const [count] = await this.userRepo.update(dto, { where: { id } });
    if (!count) {
      throw new HttpException(
        "User with that id doesn't exist",
        HttpStatus.BAD_REQUEST,
      );
    }
    return await this.userRepo.findByPk(id);
  }

  async remove(id: number) {
    const user = await this.userRepo.findByPk(id);
    const count = await this.userRepo.destroy({ where: { id } });
    if (!count) {
      throw new HttpException(
        "User with that id doesn't exist",
        HttpStatus.BAD_REQUEST,
      );
    }
    return user;
  }

  async findByEmail(email: string) {
    return await this.userRepo.findOne({ where: { email } });
  }
  async findByUsername(username: string) {
    return await this.userRepo.findOne({ where: { username } });
  }
}
