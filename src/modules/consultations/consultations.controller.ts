import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ConsultationsService } from './consultations.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationStatusDto } from './dto/update-consultation-status.dto';
import { CreateConsultationReviewDto } from './dto/create-consultation-review.dto';
import { consultation_status } from '@prisma/client';

@Controller('consultations')
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  // ==================== STUDENT ====================

  /**
   * POST /api/consultations
   * Create a consultation request
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async createConsultation(
    @CurrentUser() user: any,
    @Body() dto: CreateConsultationDto,
  ) {
    return this.consultationsService.createConsultation(user.sub, dto);
  }

  /**
   * GET /api/consultations
   * Get my consultations (as student)
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async getMyConsultations(
    @CurrentUser() user: any,
    @Query('status') status?: consultation_status,
  ) {
    return this.consultationsService.getMyConsultations(user.sub, status);
  }

  /**
   * GET /api/consultations/:id
   * Get consultation details (student or trainer)
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getConsultationDetails(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.consultationsService.getConsultationDetails(
      user.sub,
      id,
      user.role,
    );
  }

  /**
   * PATCH /api/consultations/:id/cancel
   * Cancel consultation (student, only PENDING)
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  async cancelConsultation(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.consultationsService.cancelConsultation(user.sub, id);
  }

  /**
   * POST /api/consultations/:id/review
   * Review a completed consultation
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/review')
  async createReview(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: CreateConsultationReviewDto,
  ) {
    return this.consultationsService.createReview(user.sub, id, dto);
  }

  // ==================== TRAINER ====================

  /**
   * GET /api/consultations/trainer/all
   * Get all consultations for the trainer
   */
  @UseGuards(JwtAuthGuard)
  @Get('trainer/all')
  async getTrainerConsultations(
    @CurrentUser() user: any,
    @Query('status') status?: consultation_status,
  ) {
    return this.consultationsService.getTrainerConsultations(user.sub, status);
  }

  /**
   * PATCH /api/consultations/:id/status
   * Update consultation status (trainer: approve/reject/schedule/complete/cancel)
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateConsultationStatusDto,
  ) {
    return this.consultationsService.updateConsultationStatus(
      user.sub,
      id,
      dto,
    );
  }

  /**
   * GET /api/consultations/trainer/reviews
   * Get trainer's consultation reviews
   */
  @UseGuards(JwtAuthGuard)
  @Get('trainer/reviews')
  async getTrainerReviews(@CurrentUser() user: any) {
    return this.consultationsService.getTrainerReviews(user.sub);
  }
}
