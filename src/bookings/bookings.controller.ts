import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) { }

  @Post()
  async create(@Body() createBookingDto: CreateBookingDto) {
    try {
      return await this.bookingsService.create(createBookingDto);
    } catch (error) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('validate')
  async validate(@Body() body: { phone: string; appointmentDate: string }) {
    try {
      return await this.bookingsService.validateBooking(
        body.phone,
        body.appointmentDate,
      );
    } catch (error) {
      throw new HttpException({ error: error.message }, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    try {
      return await this.bookingsService.update(id, body);
    } catch (error) {
      throw new HttpException(
        { error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.bookingsService.findOne(id);
    } catch (error) {
      throw new HttpException(
        { error: error.message },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Get()
  async findAll(@Query() query: any) {
    try {
      return await this.bookingsService.findAll(query);
    } catch (error) {
      throw new HttpException(
        { error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('available-slots')
  async findAvailableSlots(
    @Query('clinic_id') clinic_id: string,
    @Query('service_id') service_id: string,
    @Query('date') date: string,
  ) {
    try {
      return await this.bookingsService.findAvailableSlots(
        clinic_id,
        service_id,
        date,
      );
    } catch (error) {
      const status =
        error.message === 'Service not found'
          ? HttpStatus.NOT_FOUND
          : HttpStatus.BAD_REQUEST;
      throw new HttpException({ error: error.message }, status);
    }
  }
}
