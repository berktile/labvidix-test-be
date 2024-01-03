import { Injectable } from '@nestjs/common';
import { User } from 'src/models/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async signUp(signUpCredentialsDto: SignUpDto): Promise<{ token: string }> {
    const { username, email, password } = signUpCredentialsDto;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userExists = await this.userModel.findOne({ email });
    if (userExists) {
      throw new UnauthorizedException('User already exists !');
    }

    const user = await this.userModel.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = this.jwtService.sign({ id: user._id, email: user.email });
    return { token };
  }

  async logout(user: User): Promise<{ message: string }> {
    await this.userModel.findByIdAndUpdate(user._id, {
      refreshToken: null,
    });
    return { message: 'Logout successful !' };
  }

  async login(loginCredentialsDto: LoginDto): Promise<{
    token: string;
    message: string;
    user: { id: string; email: string };
  }> {
    const { email, password } = loginCredentialsDto;
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Wrong email or password !');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password !');
    }

    const token = this.jwtService.sign({ id: user._id, email: user.email });
    return {
      token,
      message: 'Login successful !',
      user: {
        id: user._id,
        email: user.email,
      },
    };
  }
}
