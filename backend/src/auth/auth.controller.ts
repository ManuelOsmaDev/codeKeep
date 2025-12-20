import { Controller, Post, Body, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    console.log("entro a register");
    
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    console.log("entro a login");
    
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      theme: user.theme,
      notifications: user.notifications,
      compactMode: user.compactMode,
      defaultLanguage: user.defaultLanguage,
      lineNumbers: user.lineNumbers,
      autoSave: user.autoSave,
      googleId : user.googleId,
      emailNotifications: user.emailNotifications,
    };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    // console.log("entro a googleAuthCallback");
    // console.log(req);
    
    const user = req.user as User;
    const token = this.authService.generateToken(user);

    // Redirect to frontend with token
    const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  }

  @Post('google/refresh')
  @UseGuards(JwtAuthGuard)
  async refreshGoogleToken(@CurrentUser() user: User) {
    const newAccessToken = await this.authService.refreshGoogleToken(user.id);
    return {
      access_token: newAccessToken,
      message: 'Google token refreshed successfully',
    };
  }
}
