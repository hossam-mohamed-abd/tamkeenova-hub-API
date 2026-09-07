import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import {
  getOtpEmailTemplate,
  getTrainerRequestEmailTemplate,
  getTrainerApprovedEmailTemplate,
  getTrainerRejectedEmailTemplate,
} from './templates/mail-templates';

// -- Deliver Transactional Email Notifications --
@Injectable()
export class MailService {
  private transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASSWORD'),
      },
    });
  }

  // -- Send a Fully Rendered Email Message --
  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string,
  ) {
    return this.transporter.sendMail({
      from: `"TamkeeNova HUB" <${this.configService.get('MAIL_USER')}>`,
      to,
      subject,
      html,
      text,
    });
  }

  // -- Send an Email Verification OTP --
  async sendOtp(email: string, otp: string) {
    await this.sendEmail(
      email,
      'كود التحقق من TamkeeNova HUB',
      getOtpEmailTemplate(otp),
      `كود التحقق بتاعك هو: ${otp} — الكود ده هينتهي خلال 10 دقايق.`,
    );
  }

  // -- Notify an Administrator of a Trainer Application --
  async sendTrainerRequestEmail(
    adminEmail: string,
    trainerName: string,
    trainerEmail: string,
  ) {
    await this.sendEmail(
      adminEmail,
      'طلب انضمام مدرب جديد — TamkeeNova HUB',
      getTrainerRequestEmailTemplate(trainerName, trainerEmail),
    );
  }

  // -- Notify a Trainer That Their Application Was Approved --
  async sendTrainerApprovedEmail(email: string, trainerName?: string) {
    await this.sendEmail(
      email,
      'تم اعتماد حسابك — TamkeeNova HUB',
      getTrainerApprovedEmailTemplate(trainerName),
    );
  }

  // -- Notify a Trainer That Their Application Was Rejected --
  async sendTrainerRejectedEmail(email: string, reason: string) {
    await this.sendEmail(
      email,
      'طلب الانضمام — TamkeeNova HUB',
      getTrainerRejectedEmailTemplate(reason),
    );
  }
}
