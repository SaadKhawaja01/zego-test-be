import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string, name?: string) {
    const user = new this.userModel({ email, password, name });
    await user.save();
    return { email: user.email, name: user.name, id: user._id };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    let match: boolean;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      match = await bcrypt.compare(password, user.password);
      if (!match) throw new UnauthorizedException('Invalid credentials');
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  login(user: UserDocument) {
    const payload = { sub: user._id, email: user.email, role: user.role };
    return { accessToken: this.jwtService.sign(payload), user };
  }
}
