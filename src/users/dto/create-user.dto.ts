import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'qwerty@mail.ru', description: 'Email of a user' })
  readonly email: string;
  @ApiProperty({ example: 'qwerty', description: 'Password of a user' })
  readonly password: string;
  @ApiProperty({ example: 'qwerty', description: 'User name' })
  readonly username: string;
}
