import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ExtractReceiptDetailsDto } from './dto/extract-receipt-details.dto';
import { AiServiceFactory } from './ai-services/ai-service.factory';
import { ExtractReceiptDetailsRequestDto } from './dto/extract-receipt-details-request.dto';
import { AiProvider, OpenAiModels } from './ai-providers';

@Injectable()
export class ReceiptExtractorService {
  private readonly storagePath = path.join(__dirname, '..', '..', 'receipts');

  constructor(private readonly aiServiceFactory: AiServiceFactory) {
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

  async extractReceiptDetails(
    file: Express.Multer.File,
    requestDto: ExtractReceiptDetailsRequestDto,
  ): Promise<ExtractReceiptDetailsDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }

    if(!requestDto.aiProvider) {
      requestDto.aiProvider = AiProvider.OPENAI
    }
    if(!requestDto.model) {
      requestDto.model = OpenAiModels.GPT_4_1_MINI
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPG, JPEG, and PNG are allowed.');
    }

    const aiService = this.aiServiceFactory.getService(requestDto.aiProvider);
    const extractedData = await aiService.extractReceiptDetails(file, requestDto.model);

    const id = uuidv4();
    const imageUrl = path.join(this.storagePath, `${id}.${file.originalname.split('.').pop()}`);
    fs.writeFileSync(imageUrl, file.buffer);

    const receiptDetails: ExtractReceiptDetailsDto = {
      id,
      ...extractedData,
      image_url: `/receipts/${id}.${file.originalname.split('.').pop()}`,
    };

    const dbPath = path.join(this.storagePath, 'db.json');
    let db = [];
    if (fs.existsSync(dbPath)) {
      db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    }
    db.push(receiptDetails);
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    return receiptDetails;
  }
}
