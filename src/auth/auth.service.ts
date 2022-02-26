import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';
import { UserNoPassword } from 'src/users/dto/user-no-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}
  async login(dto: CreateUserDto) {
    const user = await this.validate(dto);
    return this.generateToken(user);
  }

  private async validate(dto: CreateUserDto) {
    const user = await this.userService.findByEmail(dto.email);
    const passwordEquals = await bcrypt.compare(dto.password, user.password);
    if (user && passwordEquals) {
      return user;
    }
    throw new UnauthorizedException({
      message: 'Password or email is incorrect',
    });
  }

  async registration(dto: CreateUserDto) {
    const candidateEmail = await this.userService.findByEmail(dto.email);
    const candidateUsername = await this.userService.findByUsername(
      dto.username,
    );
    if (candidateUsername || candidateEmail) {
      throw new HttpException(
        'User with that email or username already exist',
        HttpStatus.BAD_REQUEST,
      );
    }
    const hashPassword = await bcrypt.hash(dto.password, 5);
    const user = await this.userService.create({
      ...dto,
      password: hashPassword,
    });
    return await this.generateToken(user);
  }
  private async generateToken(user: User | UserNoPassword) {
    const payload: UserNoPassword = {
      email: user.email,
      username: user.username,
      id: user.id,
      background: user.background,
      avatar: user.avatar,
    };
    return {
      token: this.jwtService.sign(payload),
    };
  }
  async decode(payload: { token: string }) {
    const decoded = this.jwtService.verify(payload.token) as UserNoPassword;
    return decoded;
  }
}
