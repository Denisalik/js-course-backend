import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { ChangeSettingsDto } from './dto/change-settings.dto';
import { ChangeCredentialsDto } from './dto/change-credentials.dto';

@ApiTags('Users')
@Controller('')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create User/Sign up' })
  @ApiResponse({ status: 200, type: [User] })
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, type: [User] })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, type: [User] })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update fields of a user' })
  @ApiResponse({ status: 200, type: [User] })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CreateUserDto) {
    return this.usersService.update(+id, dto);
  }

  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, type: [User] })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @ApiOperation({ summary: 'Change Avatar or Background' })
  @ApiResponse({ status: 200 })
  @Post('changesettings')
  changeSettings(@Body() dto: ChangeSettingsDto) {
    return this.usersService.changeSettings(dto);
  }

  @ApiOperation({ summary: 'Change Password or Username' })
  @ApiResponse({ status: 200 })
  @Post('changecredentials')
  changeCredentials(@Body() dto: ChangeCredentialsDto) {
    return this.usersService.changeCredentials(dto);
  }
}
