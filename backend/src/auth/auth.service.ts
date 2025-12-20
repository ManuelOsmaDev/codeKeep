import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { google } from 'googleapis';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password, avatar } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if this is the first user
    const userCount = await this.userRepository.count();
    const isAdmin = userCount === 0;

    // Create user
    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      avatar: avatar || '👨‍💻',
      isAdmin,
      canManagePasswords: isAdmin,
      canManageSnippets: isAdmin,
    });

    await this.userRepository.save(user);

    // Generate JWT
    const token = this.generateToken(user);

    return {
      access_token: token,
      user: {
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
        emailNotifications: user.emailNotifications,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT
    const token = this.generateToken(user);

    return {
      access_token: token,
      user: {
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
        emailNotifications: user.emailNotifications,
        isAdmin: user.isAdmin,
        canManagePasswords: user.canManagePasswords,
        canManageSnippets: user.canManageSnippets,
      },
    };
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  generateToken(user: User): string {
    console.log("user",user);
    
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  // Google OAuth methods
  async validateGoogleUser(profile: {
    googleId: string;
    email: string;
    name: string;
    avatar: string;
    accessToken: string;
    refreshToken?: string;
  }): Promise<User> {
    let user = await this.userRepository.findOne({
      where: { googleId: profile.googleId },
    });

    if (!user) {
      // Check if email exists
      user = await this.userRepository.findOne({
        where: { email: profile.email },
      });

      if (user) {
        // Link Google account to existing user
        user.googleId = profile.googleId;
      } else {
        // Create new user
        user = this.userRepository.create({
          googleId: profile.googleId,
          email: profile.email,
          name: profile.name,
          avatar: profile.avatar,
          password: '', // No password for Google users
        });
      }
    }

    // Update Google tokens
    user.googleAccessToken = profile.accessToken;
    user.googleRefreshToken = profile.refreshToken || user.googleRefreshToken;
    user.googleTokenExpiry = new Date(Date.now() + 3600 * 1000); // 1 hour

    return this.userRepository.save(user);
  }

  async updateGoogleTokens(
    userId: string,
    accessToken: string,
    refreshToken?: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.googleAccessToken = accessToken;
    if (refreshToken) {
      user.googleRefreshToken = refreshToken;
    }
    user.googleTokenExpiry = new Date(Date.now() + 3600 * 1000);

    await this.userRepository.save(user);
  }

  async refreshGoogleToken(userId: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.googleRefreshToken) {
      throw new UnauthorizedException('No refresh token available');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );

    oauth2Client.setCredentials({
      refresh_token: user.googleRefreshToken,
    });

    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      const newAccessToken = credentials.access_token;
      const newRefreshToken = credentials.refresh_token;

      await this.updateGoogleTokens(
        userId,
        newAccessToken,
        newRefreshToken,
      );

      return newAccessToken;
    } catch (error) {
      throw new UnauthorizedException('Failed to refresh Google token');
    }
  }
}
