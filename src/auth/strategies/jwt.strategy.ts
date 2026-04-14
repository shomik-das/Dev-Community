import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),  //req.headers.authorization.split(" ")[1]
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }
  //validate method is called by passport.js after the token is verified automatically
  async validate(payload: any) {
    const user = await this.userService.findUserById(payload.id); //Token might be valid But user might be deleted / banned. double check
    if (!user) {
      throw new UnauthorizedException();
    }
    return user; // this becomes req.user
  }
}
