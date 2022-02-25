import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Table, Model } from 'sequelize-typescript';

interface UserCreationAttr {
  email: string;
  password: string;
  username: string;
}
@Table
export class User extends Model<User, UserCreationAttr> {
  @ApiProperty({example: '1', description: 'id'})
  @Column({
    type: DataType.INTEGER,
    unique: true,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({example: 'qwerty', description: 'User name'})
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  username: string;

  @ApiProperty({example: 'qwerty', description: 'Password of a user'})
  @Column({ type: DataType.STRING, allowNull: false })
  password: string;

  @ApiProperty({example: 'qwerty@mail.ru', description: 'Email of a user'})
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  email: string;

  @ApiProperty({example: '1', description: 'type of background(constant of a color used in frontend/static image of a avatar on the frontend server)'})
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
  background: number;

  @ApiProperty({example: '1', description: 'type of avatar(static image of a avatar on the frontend server)'})
  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 1 })
  avatar: number;
}
