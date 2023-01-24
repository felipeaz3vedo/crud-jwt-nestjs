import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ParamId } from 'src/decorators/param-id.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/Roles.enum';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoleGuard } from 'src/guards/role.guard';
import { CreateUserDTO } from './dto/create-user.dto.';
import { UpdatePatchUserDTO } from './dto/update-patch-user.dto';
import { UpdatePutUserDTO } from './dto/update-put-user.dto';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';

@Roles(Role.Admin)
@UseGuards(AuthGuard, RoleGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() data: CreateUserDTO) {
    const bcryptSalt = await bcrypt.genSalt();

    data.password = await bcrypt.hash(data.password, bcryptSalt);

    return this.userService.create(data);
  }

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@ParamId() id: number) {
    console.log({ id });
    return this.userService.findOne(id);
  }

  @Put(':id')
  async update(@ParamId() id: number, @Body() data: UpdatePutUserDTO) {
    const bcryptSalt = await bcrypt.genSalt();

    data.password = await bcrypt.hash(data.password, bcryptSalt);

    return this.userService.update(id, data);
  }

  @Patch(':id')
  async updatePartial(
    @ParamId() id: number,
    @Body() { name, email, password, birthAt, role }: UpdatePatchUserDTO,
  ) {
    if (password) {
      const bcryptSalt = await bcrypt.genSalt();

      password = await bcrypt.hash(password, bcryptSalt);
    }

    return this.userService.updatePartial(id, {
      name,
      email,
      password,
      birthAt,
      role,
    });
  }

  @Delete(':id')
  async delete(@ParamId() id: number) {
    return this.userService.delete(id);
  }
}
