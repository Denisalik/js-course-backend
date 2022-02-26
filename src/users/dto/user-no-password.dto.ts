import { ApiProperty } from '@nestjs/swagger';

export class UserNoPassword {
  @ApiProperty({ example: '1', description: 'id' })
  readonly id: number;
  @ApiProperty({ example: 'qwerty@mail.ru', description: 'Email of a user' })
  readonly email: string;
  @ApiProperty({ example: 'qwerty', description: 'User name' })
  readonly username: string;
  @ApiProperty({
    example: '1',
    description:
      'type of background(constant of a color used in frontend/static image of a avatar on the frontend server)',
  })
  readonly background: number;
  @ApiProperty({
    example: '1',
    description:
      'type of avatar(static image of a avatar on the frontend server)',
  })
  readonly avatar: number;
}
