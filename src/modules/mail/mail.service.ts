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

  // -- Send Consultation Request Email to Trainer --
  async sendConsultationRequestEmail(
    trainerEmail: string,
    studentName: string,
    studentEmail: string,
    studentPhone: string,
    consultationTitle: string,
    consultationDescription: string,
    preferredDate?: string,
    preferredTime?: string,
    certificates?: string[],
    whatsapp?: string,
    bio?: string,
  ) {
    const certsHtml =
      certificates && certificates.length > 0
        ? `<h4>الشهادات:</h4><ul>${certificates.map((c) => `<li>${c}</li>`).join('')}</ul>`
        : '';

    await this.sendEmail(
      trainerEmail,
      `طلب استشارة جديد: ${consultationTitle} — TamkeeNova HUB`,
      `<div style="direction: rtl; font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
        <h2 style="color: #1a73e8;">تم استلام طلب استشارة جديد</h2>
        <hr/>
        <h3>تفاصيل الاستشارة:</h3>
        <p><strong>العنوان:</strong> ${consultationTitle}</p>
        <p><strong>الوصف:</strong> ${consultationDescription}</p>
        ${preferredDate ? `<p><strong>التاريخ المفضل:</strong> ${preferredDate}</p>` : ''}
        ${preferredTime ? `<p><strong>الوقت المفضل:</strong> ${preferredTime}</p>` : ''}
        <hr/>
        <h3>بيانات الطالب:</h3>
        <p><strong>الاسم:</strong> ${studentName}</p>
        <p><strong>الإيميل:</strong> ${studentEmail}</p>
        <p><strong>الهاتف:</strong> ${studentPhone || 'غير متوفر'}</p>
        ${whatsapp ? `<p><strong>واتساب:</strong> ${whatsapp}</p>` : ''}
        ${bio ? `<p><strong>البايو:</strong> ${bio}</p>` : ''}
        ${certsHtml}
      </div>`,
    );
  }

  // -- Send Corporate Request Notification to Admin --
  async sendCorporateRequestAdminEmail(
    adminEmail: string,
    companyName: string,
    serviceType: string,
  ) {
    await this.sendEmail(
      adminEmail,
      `طلب شركة جديد: ${companyName} — TamkeeNova HUB`,
      `<div style="direction: rtl; font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
        <h2 style="color: #1a73e8;">تم استلام طلب شركة جديد</h2>
        <hr/>
        <p><strong>الشركة:</strong> ${companyName}</p>
        <p><strong>نوع الخدمة:</strong> ${serviceType}</p>
        <p>يرجى مراجعة الطلب في لوحة التحكم.</p>
      </div>`,
    );
  }
}
