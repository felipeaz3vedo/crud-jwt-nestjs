import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDTO } from './dto/create-user.dto.';
import { UpdatePutUserDTO } from './dto/update-put-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    name,
    email,
    password,
    birthAt = null,
    role = 1,
  }: CreateUserDTO) {
    try {
      const newUser = {
        name,
        email,
        password,
        birthAt: birthAt && new Date(birthAt),
        role,
      };

      return this.prisma.user.create({
        data: newUser,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async findAll() {
    try {
      return this.prisma.user.findMany();
    } catch (error) {
      console.log(error);
    }
  }

  async findOne(id: number) {
    try {
      return await this.prisma.user.findUniqueOrThrow({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Usúario não encontrado`);
    }
  }

  async update(
    id: number,
    { name, email, password, birthAt = null, role }: UpdatePutUserDTO,
  ) {
    try {
      return this.prisma.user.update({
        data: {
          name,
          email,
          password,
          birthAt: new Date(birthAt),
          role,
        },
        where: {
          id,
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  async updatePartial(
    id: number,
    { name, email, password, birthAt, role }: UpdatePutUserDTO,
  ) {
    try {
      await this.prisma.user.findUniqueOrThrow({
        where: { id },
      });

      return this.prisma.user.update({
        data: {
          name,
          email,
          password,
          birthAt: birthAt && new Date(birthAt),
          role,
        },
        where: {
          id,
        },
      });
    } catch (error) {
      throw new NotFoundException(`Usúario não encontrado`);
    }
  }

  async delete(id: number) {
    try {
      await this.prisma.user.findUniqueOrThrow({
        where: { id },
      });

      return this.prisma.user.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      throw new NotFoundException(`Usúario não encontrado`);
    }
  }
}
