import {
  Put,
  Delete,
  Param,
  Body,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { TrainersService } from './trainers.service';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

import { UpdateTrainerProfileDto } from './dto/update-trainer-profile.dto';

import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';

import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

import { CreateReviewDto } from './dto/create-review.dto';

import { FileInterceptor } from '@nestjs/platform-express';

// -- Expose Trainer Profile, Program, and Booking Endpoints --
@Controller('trainers')
export class TrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  // -- Retrieve the Authenticated Trainer Profile --
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyProfile(@Req() req: any) {
    return this.trainersService.getMyProfile(req.user.sub);
  }

  // -- Update the Authenticated Trainer Profile --
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMyProfile(@Req() req: any, @Body() dto: UpdateTrainerProfileDto) {
    return this.trainersService.updateMyProfile(req.user.sub, dto);
  }

  // -- Create a Training Program --
  @Post('programs')
  @UseGuards(JwtAuthGuard)
  createProgram(@CurrentUser() user: any, @Body() dto: CreateProgramDto) {
    return this.trainersService.createProgram(user.sub, dto);
  }

  // -- Retrieve the Authenticated Trainer Programs --
  @Get('programs')
  @UseGuards(JwtAuthGuard)
  getMyPrograms(@CurrentUser() user: any) {
    return this.trainersService.getMyPrograms(user.sub);
  }

  // -- Update a Training Program --
  @Put('programs/:id')
  @UseGuards(JwtAuthGuard)
  updateProgram(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateProgramDto,
  ) {
    return this.trainersService.updateProgram(user.sub, id, dto);
  }

  // -- Delete a Training Program --
  @Delete('programs/:id')
  @UseGuards(JwtAuthGuard)
  deleteProgram(@CurrentUser() user: any, @Param('id') id: string) {
    return this.trainersService.deleteProgram(user.sub, id);
  }

  // -- Retrieve the Trainer Application Status --
  @Get('application-status')
  @UseGuards(JwtAuthGuard)
  getApplicationStatus(@CurrentUser() user: any) {
    return this.trainersService.getApplicationStatus(user.sub);
  }

  // -- Create a Trainer Availability Slot --
  @Post('availability')
  @UseGuards(JwtAuthGuard)
  createAvailability(
    @CurrentUser() user: any,
    @Body() dto: CreateAvailabilityDto,
  ) {
    return this.trainersService.createAvailability(user.sub, dto);
  }

  // -- Retrieve Trainer Availability Slots --
  @Get('availability')
  @UseGuards(JwtAuthGuard)
  getAvailability(@CurrentUser() user: any) {
    return this.trainersService.getAvailability(user.sub);
  }

  // -- Update a Trainer Availability Slot --
  @Patch('availability/:id')
  @UseGuards(JwtAuthGuard)
  updateAvailability(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateAvailabilityDto,
  ) {
    return this.trainersService.updateAvailability(user.sub, id, dto);
  }

  // -- Delete a Trainer Availability Slot --
  @Delete('availability/:id')
  @UseGuards(JwtAuthGuard)
  deleteAvailability(@CurrentUser() user: any, @Param('id') id: string) {
    return this.trainersService.deleteAvailability(user.sub, id);
  }

  // -- Retrieve Trainer Bookings --
  @Get('bookings')
  @UseGuards(JwtAuthGuard)
  getBookings(@CurrentUser() user: any) {
    return this.trainersService.getBookings(user.sub);
  }

  // -- Retrieve a Trainer Booking by Identifier --
  @Get('bookings/:id')
  @UseGuards(JwtAuthGuard)
  getBookingDetails(@CurrentUser() user: any, @Param('id') id: string) {
    return this.trainersService.getBookingDetails(user.sub, id);
  }

  // -- Update a Trainer Booking Status --
  @Patch('bookings/:id/status')
  @UseGuards(JwtAuthGuard)
  updateBookingStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.trainersService.updateBookingStatus(user.sub, id, dto);
  }

  // -- Create a Trainer Review --
  @Post(':trainerId/reviews')
  @UseGuards(JwtAuthGuard)
  createReview(
    @CurrentUser() user: any,
    @Param('trainerId') trainerId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.trainersService.createReview(user.sub, trainerId, dto);
  }

  @Get()
  getAllPublicTrainers() {
    return this.trainersService.getAllPublicTrainers();
  }

  // -- Retrieve Trainer Reviews --
  @Get(':trainerId/reviews')
  getTrainerReviews(@Param('trainerId') trainerId: string) {
    return this.trainersService.getTrainerReviews(trainerId);
  }

  // -- Retrieve Trainer Dashboard Metrics --
  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  getDashboard(@CurrentUser() user: any) {
    return this.trainersService.getDashboardStats(user.sub);
  }

  // -- Upload a Trainer Profile Image --
  @Post('upload-profile-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  uploadProfileImage(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.trainersService.uploadProfileImage(user.sub, file);
  }

  // -- Retrieve All Training Programs --
  @Get('/programs/all')
  getAllPrograms() {
    return this.trainersService.getAllPrograms();
  }
}
