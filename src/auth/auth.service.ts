import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { SignUpDto } from './dto/signUp.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
    private userService: UserService;
    constructor(userService: UserService) {
        this.userService = userService;
    }
    async signup(signUpDto: SignUpDto) {
        const hash = await bcrypt.hash(signUpDto.password, 10);
        /* 
        * 1. chekc if the email already exists
        * 2. hash the pass
        * 3. if not exists create a new user
        * 4. store the new user in the database
        * 5. generate a jwt token
        * 6. return the token
        * 
        */
        return this.userService.createUser({ ...signUpDto, password: hash });   
    }

    login() {
        return {
            message: 'login successfully',
            token: '1234567890'
        };
    }
}
