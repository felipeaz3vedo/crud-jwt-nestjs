import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { AuthForgetDTO } from './dto/auth-forget.dto';
import { AuthLoginDTO } from './dto/auth-login.dto';
import { AuthRegisterDTO } from './dto/auth-register.dto';
import { AuthResetDTO } from './dto/auth-reset.dto';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  private issuer = 'login';
  private audience = 'user';

  constructor(
    private readonly JWTService: JwtService,
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly mailer: MailerService,
  ) {}

  createToken(user: User) {
    return {
      accessToken: this.JWTService.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        {
          expiresIn: '7 days',
          subject: String(user.id),
          issuer: this.issuer,
          audience: this.audience,
        },
      ),
    };
  }

  verifyToken(token: string) {
    try {
      const data = this.JWTService.verify(token, {
        issuer: this.issuer,
        audience: this.audience,
      });

      return data;
    } catch (error) {
      throw new BadRequestException('Token jwt não é valido');
    }
  }

  isValidToken(token: string) {
    try {
      this.verifyToken(token);

      return true;
    } catch (error) {
      return false;
    }
  }

  async login({ email, password }: AuthLoginDTO) {
    try {
      const user = await this.prisma.user.findFirstOrThrow({
        where: { email },
      });

      if (!(await bcrypt.compare(password, user.password))) {
        throw new Error();
      }

      return this.createToken(user);
    } catch (error) {
      throw new UnauthorizedException('E-mail e/ou senha incorretos');
    }
  }

  async register({ name, email, password, birthAt, role }: AuthRegisterDTO) {
    const user = await this.userService.create({
      name,
      email,
      password,
      birthAt,
      role,
    });

    return this.createToken(user);
  }

  async forget({ email }: AuthForgetDTO) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          email,
        },
      });

      if (!user) {
        throw new UnauthorizedException('E-mail está incorreto.');
      }

      const token = this.JWTService.sign(
        {
          id: user.id,
        },
        {
          expiresIn: '30 minutes',
          subject: String(user.id),
          issuer: 'forget',
          audience: 'users',
        },
      );

      await this.mailer.sendMail({
        subject: 'Recuperação de Senha',
        to: 'joao@hcode.com.br',
        template: 'forget',
        context: {
          name: user.name,
          token,
        },
      });

      return true;
    } catch (error) {
      console.log(error);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async reset({ password, token }: AuthResetDTO) {
    try {
      const data = this.JWTService.verify(token, {
        issuer: 'forget',
        audience: 'users',
      });

      if (isNaN(Number(data.id))) {
        throw new BadRequestException('Token invalido');
      }

      const salt = await bcrypt.genSalt();
      password = await bcrypt.hash(password, salt);

      const user = await this.prisma.user.update({
        where: {
          id: Number(data.id),
        },
        data: {
          password,
        },
      });

      return this.createToken(user);
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
