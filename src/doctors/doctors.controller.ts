import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) { }

  @Get()
  async findAll(
    @Query('clinic_id') clinic_id?: string,
    @Query('service_id') service_id?: string,
  ) {
    try {
      if (!clinic_id || !service_id) {
        throw new HttpException(
          'Missing clinic_id or service_id',
          HttpStatus.BAD_REQUEST,
        );
      }
      return await this.doctorsService.findAll(clinic_id, service_id);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
