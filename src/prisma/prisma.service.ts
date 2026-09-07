import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// -- Manage the Application Database Connection --
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  // -- Connect to the Database with Incremental Retry Delays --
  async onModuleInit() {
    const maxRetries = 5;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.$connect();
        this.logger.log('Database connected successfully');
        return;
      } catch (error) {
        this.logger.warn(
          `Database connection failed (attempt ${attempt}/${maxRetries})`,
        );

        if (attempt === maxRetries) {
          this.logger.error('Could not connect to database', error as Error);
          throw error;
        }

        await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
      }
    }
  }

  // -- Close the Database Connection During Shutdown --
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
