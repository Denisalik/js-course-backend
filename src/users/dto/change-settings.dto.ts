import { ApiProperty } from '@nestjs/swagger';

export class ChangeSettingsDto {
  @ApiProperty({ example: 'qwerty', description: 'User name' })
  readonly username: string;
  @ApiProperty({
    example: '1',
    description:
      'type of background(constant of a color used in frontend/static image of a avatar on the frontend server)',
  })
  background?: number;
  @ApiProperty({
    example: '1',
    description:
      'type of avatar(static image of a avatar on the frontend server)',
  })
  avatar?: number;
}
