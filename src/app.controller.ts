import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  // -- Report API Availability --
  @Get()
  root() {
    return {
      success: true,
      message: 'Tamkeenova API Running',
      version: '1.0.0',
    };
  }

  // -- Report API Health Status --
  @Get('health')
  health() {
    return {
      success: true,
      status: 'ok',
    };
  }
}
