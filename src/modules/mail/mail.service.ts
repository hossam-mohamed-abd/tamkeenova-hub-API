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

  // -- Notify an Admin of a Volunteer Application --
  async sendVolunteerRequestEmail(
    adminEmail: string,
    volunteerName: string,
    volunteerEmail: string,
  ) {
    await this.sendEmail(
      adminEmail,
      'طلب انضمام متطوع جديد — TamkeeNova HUB',
      `<div style="direction: rtl; font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
        <h2 style="color: #1a73e8;">طلب انضمام متطوع جديد</h2>
        <hr/>
        <p><strong>الاسم:</strong> ${volunteerName}</p>
        <p><strong>الإيميل:</strong> ${volunteerEmail}</p>
        <p>يرجى مراجعة الطلب وقبوله أو رفضه من لوحة التحكم.</p>
      </div>`,
    );
  }

  // -- Notify a Volunteer That Their Application Was Approved --
  async sendVolunteerApprovedEmail(email: string, volunteerName?: string) {
    await this.sendEmail(
      email,
      'تم قبول طلب التطوع — TamkeeNova HUB',
      `<div style="direction: rtl; font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
        <h2 style="color: #1a73e8;">مبروك! تم قبولك كمتطوع</h2>
        <hr/>
        <p>أهلاً ${volunteerName || ''} بك في فريق TamkeeNova HUB.</p>
        <p>تقدر دلوقتي تستقبل المهام وتتابع ساعات التطوع والتقييمات من حسابك.</p>
      </div>`,
    );
  }

  // -- Notify a Volunteer That Their Application Was Rejected --
  async sendVolunteerRejectedEmail(email: string, reason: string) {
    await this.sendEmail(
      email,
      'طلب التطوع — TamkeeNova HUB',
      `<div style="direction: rtl; font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
        <h2 style="color: #c0392b;">نعتذر، تم رفض طلب التطوع</h2>
        <hr/>
        <p><strong>سبب الرفض:</strong> ${reason}</p>
      </div>`,
    );
  }

  // -- Notify an Assignee of a New Task --
  async sendTaskAssignedEmail(
    assigneeEmail: string,
    assigneeName: string,
    taskTitle: string,
    deadline?: string,
    priority?: string,
  ) {
    await this.sendEmail(
      assigneeEmail,
      `New Task Assigned: ${taskTitle} — TamkeeNova HUB`,
      `<div style="direction: rtl; font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
        <h2 style="color: #1a73e8;">تم إسناد مهمة جديدة إليك</h2>
        <hr/>
        <p><strong>المهمة:</strong> ${taskTitle}</p>
        ${priority ? `<p><strong>الأولوية:</strong> ${priority}</p>` : ''}
        ${deadline ? `<p><strong>الموعد النهائي:</strong> ${deadline}</p>` : ''}
        <p>يرجى فتح المنصة للاطلاع على التفاصيل والبدء في التنفيذ.</p>
      </div>`,
    );
  }

  // -- Notify the First Admin of a Task Submission --
  async sendTaskSubmittedAdminEmail(
    adminEmail: string,
    assigneeName: string,
    taskTitle: string,
  ) {
    await this.sendEmail(
      adminEmail,
      `تسليم مهمة جديد: ${taskTitle} — TamkeeNova HUB`,
      `<div style="direction: rtl; font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
        <h2 style="color: #1a73e8;">تم تسليم مهمة للمراجعة</h2>
        <hr/>
        <p><strong>المهمة:</strong> ${taskTitle}</p>
        <p><strong>المنفذ:</strong> ${assigneeName}</p>
        <p>يرجى مراجعة التسليم واتخاذ القرار.</p>
      </div>`,
    );
  }

  // -- Notify a User That a Certificate Was Issued --
  async sendCertificateIssuedEmail(
    email: string,
    holderName: string,
    certificateTitle: string,
  ) {
    await this.sendEmail(
      email,
      `شهادة جديدة: ${certificateTitle} — TamkeeNova HUB`,
      `<div style="direction: rtl; font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto;">
        <h2 style="color: #1a73e8;">تم إصدار شهادة جديدة لك</h2>
        <hr/>
        <p>أهلاً ${holderName}،</p>
        <p>تم إضافة شهادة "${certificateTitle}" إلى حسابك ويمكن التحقق منها عبر رمز التحقق الخاص بها.</p>
      </div>`,
    );
  }
}
