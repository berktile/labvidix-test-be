import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from './auth.guard';
import { UseGuards } from '@nestjs/common';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  signUp(@Body() SignUpDto: SignUpDto): Promise<{ token: string }> {
    return this.authService.signUp(SignUpDto);
  }

  @Post('/login')
  login(@Body() LoginDto: LoginDto): Promise<{ token: string }> {
    return this.authService.login(LoginDto);
  }

  @UseGuards(AuthGuard)
  @Get('/profile')
  @ApiBearerAuth('access-token')
  getMyProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(AuthGuard)
  @Get('/logout')
  @ApiBearerAuth('access-token')
  logout(@Request() req) {
    return this.authService.logout(req.user);
  }
}
