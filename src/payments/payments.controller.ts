import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Get()
  async findAll(@Query() query: any) {
    try {
      return await this.paymentsService.findAll(query);
    } catch (error) {
      throw new HttpException(
        { error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('sepay-webhook')
  @HttpCode(HttpStatus.OK)
  async handleSepayWebhook(@Body() payload: any) {
    return this.paymentsService.processSePayWebhook(payload);
  }
}
