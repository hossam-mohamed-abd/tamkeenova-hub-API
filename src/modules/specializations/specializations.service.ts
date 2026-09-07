import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { SpecializationsRepository } from './specializations.repository';

import { RequestSpecializationDto } from './dto/request-specialization.dto';

// -- Manage Specialization Lookup and Request Workflows --
@Injectable()
export class SpecializationsService {
  constructor(
    private readonly specializationsRepository: SpecializationsRepository,
  ) {}

  // -- Retrieve Available Specializations --
  async getAll() {
    return this.specializationsRepository.getAll();
  }

  // -- Retrieve a Specialization by Identifier --
  async getById(id: string) {
    const specialization =
      await this.specializationsRepository.getById(id);

    if (!specialization) {
      throw new NotFoundException(
        'Specialization not found',
      );
    }

    return specialization;
  }

  // -- Submit a New Specialization Request --
  async requestSpecialization(
    userId: string,
    dto: RequestSpecializationDto,
  ) {
    const exists =
      await this.specializationsRepository.findByName(
        dto.name_ar,
      );

    if (exists) {
      throw new BadRequestException(
        'Specialization already exists',
      );
    }

    return this.specializationsRepository.createRequest({
      user_id: userId,
      name_ar: dto.name_ar,
      name_en: dto.name_en,
    });
  }
}
