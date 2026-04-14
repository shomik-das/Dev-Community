import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    const hash = await bcrypt.hash(createUserDto.password, 10);
    const newUser = await this.userService.createUser({
      ...createUserDto,
      password: hash,
    });

    const tokens = await this.getTokens(newUser._id.toString(), newUser.role);
    await this.updateRefreshToken(newUser._id.toString(), tokens.refreshToken);

    return {
      message: 'user created successfully',
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findUserByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatching = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.getTokens(user._id.toString(), user.role);
    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);

    return {
      message: 'login successfully',
      ...tokens,
    };
  }

  async logout(userId: string) {
    await this.userService.updateRefreshToken(userId, null);
  }

  async getProfile(userId: string) {
    return await this.userService.findUserById(userId);
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.userService.findUserById(userId);
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    if (user.refreshToken !== refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.getTokens(user._id.toString(), user.role);
    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);

    return tokens;
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    await this.userService.updateRefreshToken(userId, refreshToken);
  }

  private async getTokens(userId: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { id: userId, role },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        { id: userId, role },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
