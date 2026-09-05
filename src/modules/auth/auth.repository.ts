import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUserByEmail(email: string) {
    return this.prisma.users.findUnique({
      where: { email },
    });
  }

  findUserByUsername(username: string) {
    return this.prisma.users.findUnique({
      where: { username },
    });
  }

  createUser(data: any) {
    return this.prisma.users.create({
      data,
    });
  }

  createOtp(data: any) {
    return this.prisma.email_otps.create({
      data,
    });
  }

  invalidateOldOtps(userId: string) {
    return this.prisma.email_otps.updateMany({
      where: {
        user_id: userId,
        is_used: false,
      },
      data: {
        is_used: true,
      },
    });
  }

  getValidOtp(email: string, otp: string) {
    return this.prisma.email_otps.findFirst({
      where: {
        otp_code: otp,
        is_used: false,
        users: {
          email,
        },
      },
      include: {
        users: true,
      },
    });
  }

  verifyUser(userId: string) {
    return this.prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        email_verified: true,
      },
    });
  }

  updateLastLogin(userId: string) {
    return this.prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        last_login: new Date(),
      },
    });
  }

  findUserForLogin(email: string) {
    return this.prisma.users.findUnique({
      where: {
        email,
      },
    });
  }

  markOtpUsed(id: string) {
    return this.prisma.email_otps.update({
      where: {
        id,
      },
      data: {
        is_used: true,
      },
    });
  }

  findFirstAdmin() {
    return this.prisma.users.findFirst({
      where: {
        role: 'ADMIN',
        is_active: true,
      },
    });
  }

  getPendingTrainers() {
    return this.prisma.trainers.findMany({
      where: {
        trainer_status: 'PENDING',
      },

      include: {
        users: {
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  }

  approveTrainer(trainerId: string, adminId: string) {
    return this.prisma.trainers.update({
      where: {
        id: trainerId,
      },

      data: {
        trainer_status: 'APPROVED',
        approved_by: adminId,
        approved_at: new Date(),
        rejection_reason: null,
      },

      include: {
        users: true,
      },
    });
  }

  rejectTrainer(trainerId: string, adminId: string, reason: string) {
    return this.prisma.trainers.update({
      where: {
        id: trainerId,
      },

      data: {
        trainer_status: 'REJECTED',
        approved_by: adminId,
        rejection_reason: reason,
      },

      include: {
        users: true,
      },
    });
  }

  createTrainer(data: any) {
    return this.prisma.trainers.create({
      data,
    });
  }

  findTrainerByUserId(userId: string) {
    return this.prisma.trainers.findUnique({
      where: {
        user_id: userId,
      },
    });
  }

  findUserByPhone(phone: string) {
    return this.prisma.users.findUnique({
      where: {
        phone,
      },
    });
  }

  async createNotification(data: {
    user_id: string;
    title: string;
    message: string;
  }) {
    return this.prisma.notifications.create({
      data: {
        user_id: data.user_id,
        title: data.title,
        message: data.message,
      },
    });
  }
}
