import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signUp.dto';

@Controller('auth')
export class AuthController {
    private authService: AuthService;

    
    constructor(authService: AuthService) {
        this.authService = authService;
    }


    @Post('signup')
    async signup(@Body() singnUpDto: SignUpDto) {
        const newUser = await this.authService.signup(singnUpDto);
        return newUser;
    }

    @Post('login')
    login() {
        return this.authService.login();
    }
}
