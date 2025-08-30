import { Controller, Post, UploadedFile, UseInterceptors, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReceiptExtractorService } from './receipt-extractor.service';
import { AiProvider, GoogleModels, OpenAiModels } from './ai-providers';
import { ExtractReceiptDetailsDto } from './dto/extract-receipt-details.dto';
import { ExtractReceiptDetailsRequestDto } from './dto/extract-receipt-details-request.dto';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';

@Controller('receipt-extractor')
export class ReceiptExtractorController {
  constructor(private readonly receiptExtractorService: ReceiptExtractorService) {}

  @Post('extract-receipt-details')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        aiProvider: { type: 'string', enum: Object.values(AiProvider) },
        model: { type: 'string', enum: [ ...Object.values(OpenAiModels), ...Object.values(GoogleModels)] },
      },
      required: ['file', 'aiProvider'],
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async extractReceiptDetails(
    @UploadedFile() file: Express.Multer.File,
    @Body() requestDto: ExtractReceiptDetailsRequestDto,
  ): Promise<ExtractReceiptDetailsDto> {
    return this.receiptExtractorService.extractReceiptDetails(file, requestDto);
  }
}
