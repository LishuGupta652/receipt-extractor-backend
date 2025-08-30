import { Test, TestingModule } from '@nestjs/testing';
import { ReceiptExtractorService } from './receipt-extractor.service';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import { AiServiceFactory } from './ai-services/ai-service.factory';
import { AiProvider } from './ai-providers';
import { GoogleAiService } from './ai-services/google-ai.service';
import { OpenAiService } from './ai-services/openai-ai.service';
import { GoogleAiServiceMock } from './ai-services/google-ai.service.mock';
import { OpenAiServiceMock } from './ai-services/openai-ai.service.mock';

jest.mock('fs');

describe('ReceiptExtractorService', () => {
  let service: ReceiptExtractorService;
  let googleAiService: GoogleAiServiceMock;
  let openAiService: OpenAiServiceMock;

  const mockFile = {
    fieldname: 'file',
    originalname: 'test.png',
    encoding: '7bit',
    mimetype: 'image/png',
    buffer: Buffer.from('test'),
    size: 4,
  } as Express.Multer.File;

  const mockRequestDto = {
    aiProvider: AiProvider.GOOGLE,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReceiptExtractorService,
        AiServiceFactory,
        {
          provide: GoogleAiService,
          useClass: GoogleAiServiceMock,
        },
        {
          provide: OpenAiService,
          useClass: OpenAiServiceMock,
        },
      ],
    }).compile();

    service = module.get<ReceiptExtractorService>(ReceiptExtractorService);
    googleAiService = module.get<GoogleAiService>(GoogleAiService) as unknown as GoogleAiServiceMock;
    openAiService = module.get<OpenAiService>(OpenAiService) as unknown as OpenAiServiceMock;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('extractReceiptDetails', () => {
    it('should extract receipt details successfully with Google AI', async () => {
      const mockResponse = {
        date: '2025-08-23',
        currency: 'USD',
        vendor_name: 'Test Vendor',
        receipt_items: [{ item_name: 'Test Item', item_cost: 10 }],
        tax: 1,
        total: 11,
      };
      googleAiService.extractReceiptDetails.mockResolvedValue(mockResponse);

      const result = await service.extractReceiptDetails(mockFile, mockRequestDto);

      expect(result).toBeDefined();
      expect(result.vendor_name).toEqual('Test Vendor');
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should extract receipt details successfully with OpenAI', async () => {
      const mockResponse = {
        date: '2025-08-23',
        currency: 'USD',
        vendor_name: 'Test Vendor',
        receipt_items: [{ item_name: 'Test Item', item_cost: 10 }],
        tax: 1,
        total: 11,
      };
      openAiService.extractReceiptDetails.mockResolvedValue(mockResponse);

      const result = await service.extractReceiptDetails(mockFile, { aiProvider: AiProvider.OPENAI });

      expect(result).toBeDefined();
      expect(result.vendor_name).toEqual('Test Vendor');
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid file type', async () => {
      const invalidFile = { ...mockFile, mimetype: 'application/pdf' };
      await expect(service.extractReceiptDetails(invalidFile, mockRequestDto)).rejects.toThrow(BadRequestException);
    });
  });
});