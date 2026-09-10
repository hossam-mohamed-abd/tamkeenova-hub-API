import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { StudentsRepository } from './students.repository';
import { StorageService } from '../storage/storage.service';
import { MailService } from '../mail/mail.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateContactInfoDto } from './dto/update-contact-info.dto';
import { SearchTrainersDto } from './dto/search-trainers.dto';
import { SearchProgramsDto } from './dto/search-programs.dto';
import { EnrollProgramDto } from './dto/enroll-program.dto';
import { EditReviewDto } from './dto/edit-review.dto';
import { enrollment_status } from '@prisma/client';

@Injectable()
export class StudentsService {
  constructor(
    private readonly studentsRepo: StudentsRepository,
    private readonly storageService: StorageService,
    private readonly mailService: MailService,
  ) {}

  // ==================== PROFILE ====================

  async getProfile(userId: string) {
    const profile = await this.studentsRepo.getProfile(userId);

    if (!profile) {
      throw new BadRequestException('User not found');
    }

    const {
      student_enrollments,
      certificates,
      student_skills,
      ...userData
    } = profile;

    return {
      ...userData,
      completed_programs_count: student_enrollments.length,
      certificates_count: certificates.length,
      skills: student_skills.map((s) => ({
        name: s.skill_name,
        source: s.source,
      })),
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.username) {
      const existingUser = await this.studentsRepo.findUserByUsername(
        dto.username,
      );
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Username is already taken');
      }
    }

    return this.studentsRepo.updateProfile(userId, dto);
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/jpg',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only JPG, PNG, and WEBP images are allowed',
      );
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size must not exceed 5MB');
    }

    const result = await this.storageService.uploadFile(
      'avatars',
      file.originalname,
      file.buffer,
      file.mimetype,
    );

    return this.studentsRepo.updateAvatar(userId, result.url);
  }

  // ==================== PASSWORD ====================

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const currentHash = await this.studentsRepo.getPasswordHash(userId);

    if (!currentHash) {
      throw new BadRequestException('User not found');
    }

    const isMatch = await bcrypt.compare(dto.current_password, currentHash);
    if (!isMatch) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const isSamePassword = await bcrypt.compare(
      dto.new_password,
      currentHash,
    );
    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.new_password, salt);

    await this.studentsRepo.updatePassword(userId, hashedPassword);

    return { message: 'Password changed successfully' };
  }

  // ==================== CONTACT INFO ====================

  async getContactInfo(userId: string) {
    return this.studentsRepo.getContactInfo(userId);
  }

  async updateContactInfo(userId: string, dto: UpdateContactInfoDto) {
    if (dto.email) {
      const existingUser = await this.studentsRepo.findUserByEmail(dto.email);
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Email is already in use');
      }
    }

    if (dto.phone) {
      const existingPhone = await this.studentsRepo.findUserByPhone(dto.phone);
      if (existingPhone && existingPhone.id !== userId) {
        throw new ConflictException('Phone number is already in use');
      }
    }

    return this.studentsRepo.updateContactInfo(userId, dto);
  }

  // ==================== TRAINER SEARCH ====================

  async searchTrainers(dto: SearchTrainersDto) {
    return this.studentsRepo.searchTrainers({
      search: dto.search,
      specialization_id: dto.specialization_id,
      min_rating: dto.min_rating,
      page: dto.page || 1,
      limit: dto.limit || 10,
    });
  }

  // ==================== PROGRAMS ====================

  async searchPrograms(dto: SearchProgramsDto) {
    return this.studentsRepo.searchPrograms({
      search: dto.search,
      level: dto.level,
      trainer_id: dto.trainer_id,
      min_price: dto.min_price,
      max_price: dto.max_price,
      page: dto.page || 1,
      limit: dto.limit || 10,
    });
  }

  async getProgramDetails(programId: string) {
    const program = await this.studentsRepo.getProgramById(programId);

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    return {
      ...program,
      enrolled_count: program._count.student_enrollments,
      _count: undefined,
    };
  }

  // ==================== ENROLLMENTS ====================

  async enrollInProgram(studentId: string, dto: EnrollProgramDto) {
    // 1. Check program exists and is active
    const program = await this.studentsRepo.getProgramById(dto.program_id);
    if (!program) {
      throw new NotFoundException('Program not found');
    }
    if (!program.is_active) {
      throw new BadRequestException('This program is not currently available');
    }

    // 2. Check student not already enrolled
    const existingEnrollment = await this.studentsRepo.findEnrollment(
      studentId,
      dto.program_id,
    );

    if (existingEnrollment) {
      if (existingEnrollment.status === 'ACTIVE') {
        throw new ConflictException(
          'You are already enrolled in this program',
        );
      }
      // If cancelled or completed, allow re-enrollment
      if (
        existingEnrollment.status === 'CANCELLED' ||
        existingEnrollment.status === 'COMPLETED'
      ) {
        // Delete old enrollment and create new one
        await this.studentsRepo.cancelEnrollment(existingEnrollment.id);
      }
    }

    // 3. Create enrollment
    const enrollment = await this.studentsRepo.createEnrollment(
      studentId,
      dto.program_id,
    );

    return {
      message: 'Successfully enrolled in program',
      enrollment,
    };
  }

  async getMyEnrollments(studentId: string, status?: enrollment_status) {
    const enrollments = await this.studentsRepo.getStudentEnrollments(
      studentId,
      status,
    );

    return {
      data: enrollments,
      total: enrollments.length,
    };
  }

  async getEnrollmentDetails(studentId: string, enrollmentId: string) {
    const enrollment = await this.studentsRepo.getEnrollmentById(
      enrollmentId,
      studentId,
    );

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    return enrollment;
  }

  async cancelEnrollment(studentId: string, enrollmentId: string) {
    // 1. Check enrollment exists and belongs to student
    const enrollment = await this.studentsRepo.getEnrollmentById(
      enrollmentId,
      studentId,
    );

    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    // 2. Only ACTIVE enrollments can be cancelled
    if (enrollment.status !== 'ACTIVE') {
      throw new BadRequestException(
        `Cannot cancel enrollment with status "${enrollment.status}"`,
      );
    }

    // 3. Cancel
    const cancelled = await this.studentsRepo.cancelEnrollment(enrollmentId);

    return {
      message: 'Enrollment cancelled successfully',
      enrollment: cancelled,
    };
  }

  // ==================== CERTIFICATES ====================

  async getMyCertificates(studentId: string) {
    const certificates = await this.studentsRepo.getStudentCertificates(
      studentId,
    );

    return {
      data: certificates,
      total: certificates.length,
    };
  }

  async verifyCertificate(verificationCode: string) {
    const certificate = await this.studentsRepo.getCertificateByVerificationCode(
      verificationCode,
    );

    if (!certificate) {
      throw new NotFoundException('Certificate not found');
    }

    return {
      valid: certificate.is_valid,
      certificate,
    };
  }

  // ==================== REVIEWS ====================

  async getMyReviews(studentId: string) {
    const reviews = await this.studentsRepo.getMyReviews(studentId);
    return {
      data: reviews,
      total: reviews.length,
    };
  }

  async editReview(studentId: string, reviewId: string, dto: EditReviewDto) {
    // 1. Check review exists and belongs to student
    const review = await this.studentsRepo.getReviewById(reviewId, studentId);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // 2. At least one field must be provided
    if (dto.rating === undefined && dto.comment === undefined) {
      throw new BadRequestException('At least one field (rating or comment) must be provided');
    }

    // 3. Update
    const updated = await this.studentsRepo.updateReview(reviewId, {
      ...(dto.rating !== undefined && { rating: dto.rating }),
      ...(dto.comment !== undefined && { comment: dto.comment }),
    });

    // 4. Recalculate trainer average rating
    const avgRating = await this.studentsRepo.getTrainerAverageRating(
      review.trainer_id,
    );
    await this.studentsRepo.updateTrainerRating(
      review.trainer_id,
      avgRating.average,
      avgRating.count,
    );

    return {
      message: 'Review updated successfully',
      review: updated,
    };
  }

  async deleteReview(studentId: string, reviewId: string) {
    // 1. Check review exists and belongs to student
    const review = await this.studentsRepo.getReviewById(reviewId, studentId);

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // 2. Delete
    await this.studentsRepo.deleteReview(reviewId);

    // 3. Recalculate trainer average rating
    const avgRating = await this.studentsRepo.getTrainerAverageRating(
      review.trainer_id,
    );
    await this.studentsRepo.updateTrainerRating(
      review.trainer_id,
      avgRating.average,
      avgRating.count,
    );

    return {
      message: 'Review deleted successfully',
    };
  }

  // ==================== PUBLIC PROFILE ====================

  async getPublicProfile(username: string) {
    const profile = await this.studentsRepo.getPublicProfileByUsername(username);

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    const {
      student_enrollments,
      certificates,
      student_skills,
      ...userData
    } = profile;

    // Calculate total training hours from certificates
    const totalHours = certificates.reduce(
      (sum, c) => sum + (c.training_hours || 0),
      0,
    );

    return {
      ...userData,
      total_training_hours: userData.total_training_hours || totalHours,
      completed_programs: student_enrollments.map((e) => ({
        id: e.id,
        completed_at: e.completed_at,
        program: e.training_programs,
      })),
      certificates: certificates.map((c) => ({
        id: c.id,
        title: c.title,
        verification_code: c.verification_code,
        issued_at: c.issued_at,
        training_hours: c.training_hours,
        program: c.training_programs,
        trainer: c.trainers,
      })),
      skills: student_skills.map((s) => ({
        name: s.skill_name,
        source: s.source,
      })),
      stats: {
        completed_programs_count: student_enrollments.length,
        certificates_count: certificates.length,
        skills_count: student_skills.length,
        total_training_hours: userData.total_training_hours || totalHours,
      },
    };
  }

  // ==================== UTILS ====================

  generateVerificationCode(): string {
    // Format: TAM-XXXXXXXX (8 hex chars)
    return `TAM-${randomBytes(4).toString('hex').toUpperCase()}`;
  }
}
