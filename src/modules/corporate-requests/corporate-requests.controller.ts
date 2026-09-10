import {
  Controller,
  Get,
  Post,
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
import { CorporateRequestsService } from './corporate-requests.service';
import { CreateCorporateRequestDto } from './dto/create-corporate-request.dto';
import { corporate_status } from '@prisma/client';

@Controller('corporate-requests')
export class CorporateRequestsController {
  constructor(
    private readonly corporateRequestsService: CorporateRequestsService,
  ) {}

  /**
   * POST /api/corporate-requests
   * Submit a new corporate request
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async createRequest(
    @CurrentUser() user: any,
    @Body() dto: CreateCorporateRequestDto,
  ) {
    return this.corporateRequestsService.createRequest(user.sub, dto);
  }

  /**
   * POST /api/corporate-requests/:id/attachments
   * Upload attachment (RFP, PDF, etc.)
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/attachments')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAttachment(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.corporateRequestsService.uploadAttachment(
      user.sub,
      id,
      file,
    );
  }

  /**
   * GET /api/corporate-requests
   * Get my corporate requests
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async getMyRequests(
    @CurrentUser() user: any,
    @Query('status') status?: corporate_status,
  ) {
    return this.corporateRequestsService.getMyRequests(user.sub, status);
  }

  /**
   * GET /api/corporate-requests/:id
   * Get corporate request details
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getRequestDetails(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.corporateRequestsService.getRequestDetails(user.sub, id);
  }
}
