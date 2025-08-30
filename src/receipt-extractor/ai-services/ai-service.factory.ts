import { Injectable } from '@nestjs/common';
import { AiProvider } from '../ai-providers';
import { AiService } from './ai.service';
import { GoogleAiService } from './google-ai.service';
import { OpenAiService } from './openai-ai.service';

@Injectable()
export class AiServiceFactory {
  constructor(private readonly googleAiService: GoogleAiService, private readonly openAiService: OpenAiService) {}

  getService(provider: AiProvider): AiService {
    switch (provider) {
      case AiProvider.GOOGLE:
        return this.googleAiService;
      case AiProvider.OPENAI:
        return this.openAiService;
      default:
        throw new Error('Invalid AI provider');
    }
  }
}
