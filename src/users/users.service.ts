import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private userRepo: typeof User) {}

  async create(dto: CreateUserDto) {
    const user = await this.userRepo.create(dto);
    return user;
  }

  async findAll() {
    const users = await this.userRepo.findAll();
    return users;
  }

  async findOne(id: number) {
    const user = await this.userRepo.findByPk(id);
    return user;
  }

  async update(id: number, dto: CreateUserDto) {
    const [count] = await this.userRepo.update(dto, {where: {id}});
    if(!count){
      throw new HttpException(
        'User with that id doesn\'t exist',
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.userRepo.findByPk(id);
    return user;
  }

  async remove(id: number) {
    const user = await this.userRepo.findByPk(id);
    const count = await this.userRepo.destroy({where: {id}});
    if(!count){
      throw new HttpException(
        'User with that id doesn\'t exist',
        HttpStatus.BAD_REQUEST,
      );
    }
    return user;
  }

  async findByEmail(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    return user;
  }
  async findByUsername(username: string) {
    const user = await this.userRepo.findOne({ where: { username } });
    return user;
  }
}
