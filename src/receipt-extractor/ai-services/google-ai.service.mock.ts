import { AiService } from './ai.service';

export class GoogleAiServiceMock implements AiService {
  extractReceiptDetails = jest.fn();
}
