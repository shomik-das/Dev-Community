import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    signup() {
        /* 
        * 1. chekc if the email already exists
        * 2. hash the pass
        * 3. if not exists create a new user
        * 4. store the new user in the database
        * 5. generate a jwt token
        * 6. return the token
        * 
        */
        return {
            message: 'sign up successfully',
            token: '1234567890'
        };
    }

    login() {
        return {
            message: 'login successfully',
            token: '1234567890'
        };
    }
}
