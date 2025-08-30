import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReceiptExtractorModule } from './receipt-extractor/receipt-extractor.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60 * 60 * 1000, // 60 minutes in milliseconds
        limit: 10, // 10 requests per 60 minutes
      },
    ]),
    ReceiptExtractorModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
