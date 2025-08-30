import { Module } from '@nestjs/common';
import { ReceiptExtractorController } from './receipt-extractor.controller';
import { ReceiptExtractorService } from './receipt-extractor.service';
import { ConfigModule } from '@nestjs/config';
import { AiServiceFactory } from './ai-services/ai-service.factory';
import { GoogleAiService } from './ai-services/google-ai.service';
import { OpenAiService } from './ai-services/openai-ai.service';
import { OcrService } from './ocr.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [ReceiptExtractorController],
  providers: [ReceiptExtractorService, AiServiceFactory, GoogleAiService, OpenAiService, OcrService],
  exports: [ReceiptExtractorService],
})
export class ReceiptExtractorModule {}
