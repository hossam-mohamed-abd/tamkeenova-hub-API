import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import {
  getOtpEmailTemplate,
  getTrainerRequestEmailTemplate,
  getTrainerApprovedEmailTemplate,
  getTrainerRejectedEmailTemplate,
  getConsultationRequestEmailTemplate,
  getCorporateRequestAdminEmailTemplate,
  getVolunteerRequestEmailTemplate,
  getVolunteerApprovedEmailTemplate,
  getVolunteerRejectedEmailTemplate,
  getTaskAssignedEmailTemplate,
  getTaskSubmittedAdminEmailTemplate,
  getCertificateIssuedEmailTemplate,
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
    await this.sendEmail(
      trainerEmail,
      `طلب استشارة جديد: ${consultationTitle} — TamkeeNova HUB`,
      getConsultationRequestEmailTemplate({
        studentName,
        studentEmail,
        studentPhone,
        whatsapp,
        bio,
        consultationTitle,
        consultationDescription,
        preferredDate,
        preferredTime,
        certificates,
      }),
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
      getCorporateRequestAdminEmailTemplate(companyName, serviceType),
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
      getVolunteerRequestEmailTemplate(volunteerName, volunteerEmail),
    );
  }

  // -- Notify a Volunteer That Their Application Was Approved --
  async sendVolunteerApprovedEmail(email: string, volunteerName?: string) {
    await this.sendEmail(
      email,
      'تم قبول طلب التطوع — TamkeeNova HUB',
      getVolunteerApprovedEmailTemplate(volunteerName),
    );
  }

  // -- Notify a Volunteer That Their Application Was Rejected --
  async sendVolunteerRejectedEmail(email: string, reason: string) {
    await this.sendEmail(
      email,
      'طلب التطوع — TamkeeNova HUB',
      getVolunteerRejectedEmailTemplate(reason),
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
      getTaskAssignedEmailTemplate({
        assigneeName,
        taskTitle,
        deadline,
        priority,
      }),
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
      getTaskSubmittedAdminEmailTemplate(assigneeName, taskTitle),
    );
  }

  // -- Notify a User That a Certificate Was Issued --
  async sendCertificateIssuedEmail(
    email: string,
    holderName: string,
    certificateTitle: string,
    verificationCode?: string,
  ) {
    await this.sendEmail(
      email,
      `شهادة جديدة: ${certificateTitle} — TamkeeNova HUB`,
      getCertificateIssuedEmailTemplate(
        holderName,
        certificateTitle,
        verificationCode,
      ),
    );
  }
}
