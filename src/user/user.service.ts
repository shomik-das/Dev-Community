import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
    createUser() {
        return {
            message: 'user created successfully',
        };
    }
}