import { ApiProperty } from '@nestjs/swagger';

export class ChangeCredentialsDto {
  @ApiProperty({ example: 'qwerty', description: 'Password of a user' })
  password?: string;
  @ApiProperty({ example: 'qwerty', description: 'New Username' })
  newUsername?: string;
  @ApiProperty({ example: 'qwerty', description: 'User name' })
  username?: string;
}
