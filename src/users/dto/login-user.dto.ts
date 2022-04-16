import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ example: 'qwerty', description: 'Password of a user' })
  readonly password: string;
  @ApiProperty({ example: 'qwerty', description: 'User name' })
  readonly username: string;
}
