import { Controller, Get, Param } from '@nestjs/common';
import { VerificationService } from './verification.service';

@Controller('verify')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  /**
   * GET /api/verify/certificate/:code
   * Verify a single certificate by verification code
   * Public — no auth required
   */
  @Get('certificate/:code')
  async verifyCertificate(@Param('code') code: string) {
    return this.verificationService.verifyCertificate(code);
  }

  /**
   * GET /api/verify/user/:username
   * Full user verification: certificates, programs, trainers, skills, hours
   * Public — no auth required
   */
  @Get('user/:username')
  async verifyUser(@Param('username') username: string) {
    return this.verificationService.verifyUser(username);
  }
}
