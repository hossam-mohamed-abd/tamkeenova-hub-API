import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { SpecializationsService } from './specializations.service';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

import { CurrentUser } from '../../common/decorators/current-user.decorator';

import { RequestSpecializationDto } from './dto/request-specialization.dto';

// -- Expose Specialization API Endpoints --
@Controller('specializations')
export class SpecializationsController {
  constructor(
    private readonly specializationsService: SpecializationsService,
  ) {}

  // -- Retrieve Available Specializations --
  @Get()
  getAll() {
    return this.specializationsService.getAll();
  }

  // -- Retrieve a Specialization by Identifier --
  @Get(':id')
  getById(@Param('id') id: string) {
    return this.specializationsService.getById(id);
  }

  // -- Submit a Specialization Request --
  @Post('request')
  @UseGuards(JwtAuthGuard)
  requestSpecialization(
    @CurrentUser() user: any,
    @Body() dto: RequestSpecializationDto,
  ) {
    return this.specializationsService.requestSpecialization(
      user.sub,
      dto,
    );
  }
}
