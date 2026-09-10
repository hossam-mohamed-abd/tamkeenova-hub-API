import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { StudentsService } from './students.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateContactInfoDto } from './dto/update-contact-info.dto';
import { SearchTrainersDto } from './dto/search-trainers.dto';
import { SearchProgramsDto } from './dto/search-programs.dto';
import { EnrollProgramDto } from './dto/enroll-program.dto';
import { EditReviewDto } from './dto/edit-review.dto';
import { enrollment_status } from '@prisma/client';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  // ==================== PUBLIC PROFILE ====================
  // ⚠️ MUST be before :id routes to avoid conflicts

  /**
   * GET /api/students/u/:username
   * Public profile — no auth required
   */
  @Get('u/:username')
  async getPublicProfile(@Param('username') username: string) {
    return this.studentsService.getPublicProfile(username);
  }

  // ==================== PROFILE ====================

  /**
   * GET /api/students/profile
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    return this.studentsService.getProfile(user.sub);
  }

  /**
   * PATCH /api/students/profile
   */
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.studentsService.updateProfile(user.sub, dto);
  }

  /**
   * PATCH /api/students/avatar
   */
  @UseGuards(JwtAuthGuard)
  @Patch('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.studentsService.uploadAvatar(user.sub, file);
  }

  // ==================== PASSWORD ====================

  /**
   * PATCH /api/students/change-password
   */
  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(
    @CurrentUser() user: any,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.studentsService.changePassword(user.sub, dto);
  }

  // ==================== CONTACT INFO ====================

  /**
   * GET /api/students/contact-info
   */
  @UseGuards(JwtAuthGuard)
  @Get('contact-info')
  async getContactInfo(@CurrentUser() user: any) {
    return this.studentsService.getContactInfo(user.sub);
  }

  /**
   * PATCH /api/students/contact-info
   */
  @UseGuards(JwtAuthGuard)
  @Patch('contact-info')
  async updateContactInfo(
    @CurrentUser() user: any,
    @Body() dto: UpdateContactInfoDto,
  ) {
    return this.studentsService.updateContactInfo(user.sub, dto);
  }

  // ==================== TRAINER SEARCH ====================

  /**
   * GET /api/students/trainers
   */
  @UseGuards(JwtAuthGuard)
  @Get('trainers')
  async searchTrainers(@Query() dto: SearchTrainersDto) {
    return this.studentsService.searchTrainers(dto);
  }

  // ==================== PROGRAMS ====================

  /**
   * GET /api/students/programs
   */
  @UseGuards(JwtAuthGuard)
  @Get('programs')
  async searchPrograms(@Query() dto: SearchProgramsDto) {
    return this.studentsService.searchPrograms(dto);
  }

  /**
   * GET /api/students/programs/:id
   */
  @UseGuards(JwtAuthGuard)
  @Get('programs/:id')
  async getProgramDetails(@Param('id') id: string) {
    return this.studentsService.getProgramDetails(id);
  }

  // ==================== ENROLLMENTS ====================

  /**
   * POST /api/students/enrollments
   */
  @UseGuards(JwtAuthGuard)
  @Post('enrollments')
  async enrollInProgram(
    @CurrentUser() user: any,
    @Body() dto: EnrollProgramDto,
  ) {
    return this.studentsService.enrollInProgram(user.sub, dto);
  }

  /**
   * GET /api/students/enrollments
   */
  @UseGuards(JwtAuthGuard)
  @Get('enrollments')
  async getMyEnrollments(
    @CurrentUser() user: any,
    @Query('status') status?: enrollment_status,
  ) {
    return this.studentsService.getMyEnrollments(user.sub, status);
  }

  /**
   * GET /api/students/enrollments/:id
   */
  @UseGuards(JwtAuthGuard)
  @Get('enrollments/:id')
  async getEnrollmentDetails(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.studentsService.getEnrollmentDetails(user.sub, id);
  }

  /**
   * PATCH /api/students/enrollments/:id/cancel
   */
  @UseGuards(JwtAuthGuard)
  @Patch('enrollments/:id/cancel')
  async cancelEnrollment(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.studentsService.cancelEnrollment(user.sub, id);
  }

  // ==================== REVIEWS ====================

  /**
   * GET /api/students/reviews
   * Get all my reviews
   */
  @UseGuards(JwtAuthGuard)
  @Get('reviews')
  async getMyReviews(@CurrentUser() user: any) {
    return this.studentsService.getMyReviews(user.sub);
  }

  /**
   * PATCH /api/students/reviews/:id
   * Edit a review
   */
  @UseGuards(JwtAuthGuard)
  @Patch('reviews/:id')
  async editReview(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: EditReviewDto,
  ) {
    return this.studentsService.editReview(user.sub, id, dto);
  }

  /**
   * DELETE /api/students/reviews/:id
   * Delete a review
   */
  @UseGuards(JwtAuthGuard)
  @Delete('reviews/:id')
  async deleteReview(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.studentsService.deleteReview(user.sub, id);
  }

  // ==================== CERTIFICATES ====================

  /**
   * GET /api/students/certificates
   */
  @UseGuards(JwtAuthGuard)
  @Get('certificates')
  async getMyCertificates(@CurrentUser() user: any) {
    return this.studentsService.getMyCertificates(user.sub);
  }

  /**
   * GET /api/students/certificates/verify/:code
   * Public endpoint — no auth required
   */
  @Get('certificates/verify/:code')
  async verifyCertificate(@Param('code') code: string) {
    return this.studentsService.verifyCertificate(code);
  }
}
