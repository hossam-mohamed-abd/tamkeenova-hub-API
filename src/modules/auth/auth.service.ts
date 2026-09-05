import { BadRequestException, Injectable } from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

import { AuthRepository } from './auth.repository';
import { generateOtp } from './utils/otp.util';
import { MailService } from '../mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const emailExists = await this.authRepository.findUserByEmail(dto.email);

    if (emailExists) {
      throw new BadRequestException('Email already exists');
    }

    const usernameExists = await this.authRepository.findUserByUsername(
      dto.username,
    );

    if (usernameExists) {
      throw new BadRequestException('Username already exists');
    }

    const phoneExists = await this.authRepository.findUserByPhone(dto.phone);

    if (phoneExists) {
      throw new BadRequestException('Phone number already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.authRepository.createUser({
      full_name: dto.full_name,
      username: dto.username,
      email: dto.email,
      phone: dto.phone,
      password: hashedPassword,
      role: dto.role,
    });

    if (dto.role === 'TRAINER') {
      await this.authRepository.createTrainer({
        user_id: user.id,
        slug: dto.username + '-' + Math.floor(Math.random() * 100000),
        trainer_status: 'PENDING',
      });

      const admin = await this.authRepository.findFirstAdmin();

      if (admin) {
        // Email
        await this.mailService.sendTrainerRequestEmail(
          admin.email,
          dto.full_name,
          dto.email,
        );

        // Notification
        await this.authRepository.createNotification({
          user_id: admin.id,
          title: 'طلب مدرب جديد',
          message: `${dto.full_name} قام بإرسال طلب تسجيل كمدرب`,
        });
      }
    }

    const otp = generateOtp();

    await this.authRepository.createOtp({
      user_id: user.id,
      otp_code: otp,
      expires_at: new Date(Date.now() + 10 * 60 * 1000),
    });

    await this.mailService.sendOtp(user.email, otp);

    return {
      success: true,
      message:
        dto.role === 'TRAINER'
          ? 'Trainer request submitted successfully. Verify your email.'
          : 'Account created successfully. Verify your email.',

      user_id: user.id,
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const otpRecord = await this.authRepository.getValidOtp(dto.email, dto.otp);

    if (!otpRecord) {
      throw new BadRequestException('Invalid OTP');
    }

    if (otpRecord.expires_at.getTime() < Date.now()) {
      throw new BadRequestException('OTP expired');
    }

    await this.authRepository.verifyUser(otpRecord.user_id);

    await this.authRepository.markOtpUsed(otpRecord.id);

    return {
      success: true,
      message: 'Email verified successfully',
    };
  }

  async resendOtp(dto: { email: string }) {
    const user = await this.authRepository.findUserByEmail(dto.email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.email_verified) {
      throw new BadRequestException('Email already verified');
    }

    await this.authRepository.invalidateOldOtps(user.id);

    const otp = generateOtp();

    await this.authRepository.createOtp({
      user_id: user.id,
      otp_code: otp,
      expires_at: new Date(Date.now() + 10 * 60 * 1000),
    });

    await this.mailService.sendOtp(user.email, otp);

    return {
      success: true,
      message: 'OTP sent successfully',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.authRepository.findUserForLogin(dto.email);

    if (!user) {
      throw new BadRequestException('Invalid email or password');
    }

    if (!user.email_verified) {
      throw new BadRequestException('Email not verified');
    }

    if (!user.is_active) {
      throw new BadRequestException('Account disabled');
    }

    const passwordMatched = await bcrypt.compare(dto.password, user.password);

    if (!passwordMatched) {
      throw new BadRequestException('Invalid email or password');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    await this.authRepository.updateLastLogin(user.id);

    return {
      success: true,
      message: 'Login successful',

      data: {
        access_token: accessToken,

        user: {
          id: user.id,
          full_name: user.full_name,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
    };
  }
}
