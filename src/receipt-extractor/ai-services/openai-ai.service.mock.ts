import { AiService } from './ai.service';

export class OpenAiServiceMock implements AiService {
  extractReceiptDetails = jest.fn();
}
