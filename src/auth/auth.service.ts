import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { SignUpDto } from './dto/signUp.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
    private userService: UserService;
    private jwtService: JwtService;
    constructor(userService: UserService, jwtService: JwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }
    async signup(signUpDto: SignUpDto) {
        const hash = await bcrypt.hash(signUpDto.password, 10);
        const newUser = await this.userService.createUser({ ...signUpDto, password: hash });
        const payload = { id: newUser._id, role: newUser.role };
        const token = this.jwtService.sign(payload);
        return {
            message: 'user created successfully',
            token: token
        };
    }

    async login(loginDto: LoginDto) {
        const user = await this.userService.findUserByEmail(loginDto.email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordMatching = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordMatching) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { id: user._id, role: user.role };
        const token = this.jwtService.sign(payload);

        return {
            message: 'login successfully',
            token: token
        };
    }

    async getProfile(userId: string) {
        return await this.userService.findUserById(userId);
    }
}
