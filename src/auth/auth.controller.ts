import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signUp.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './auth.gurd';

@Controller('auth')
export class AuthController {
    private authService: AuthService;
    

    
    constructor(authService: AuthService) {
        this.authService = authService;
    }


    @Post('signup')
    async signup(@Body() singnUpDto: SignUpDto) {
        const res = await this.authService.signup(singnUpDto);
        return res;
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        const res = await this.authService.login(loginDto);
        return res;
    }

    @UseGuards(AuthGuard)
    @Get('profile')
    async getProfile(@Request() req) {
        const user = await this.authService.getProfile(req.user.id);
        return user;
    }
}
