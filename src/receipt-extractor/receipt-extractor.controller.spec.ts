import { Test, TestingModule } from '@nestjs/testing';
import { ReceiptExtractorController } from './receipt-extractor.controller';
import { ReceiptExtractorService } from './receipt-extractor.service';
import { AiProvider } from './ai-providers';

describe('ReceiptExtractorController', () => {
  let controller: ReceiptExtractorController;
  let service: ReceiptExtractorService;

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
      controllers: [ReceiptExtractorController],
      providers: [
        {
          provide: ReceiptExtractorService,
          useValue: {
            extractReceiptDetails: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    controller = module.get<ReceiptExtractorController>(ReceiptExtractorController);
    service = module.get<ReceiptExtractorService>(ReceiptExtractorService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('extractReceiptDetails', () => {
    it('should call the service with the file and dto', async () => {
      await controller.extractReceiptDetails(mockFile, mockRequestDto);
      expect(service.extractReceiptDetails).toHaveBeenCalledWith(mockFile, mockRequestDto);
    });
  });
});
