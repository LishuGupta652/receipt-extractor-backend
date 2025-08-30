import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AiService } from './ai.service';
import { OpenAiModels } from '../ai-providers';
import { OcrService } from '../ocr.service';

@Injectable()
export class OpenAiService implements AiService {
  private readonly openai: OpenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly ocrService: OcrService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async extractReceiptDetails(
    file: Express.Multer.File,
    model: string = OpenAiModels.GPT_4_1_MINI,
  ): Promise<any> {
    const prompt = `
You are a receipt extraction assistant. 
Analyze the OCR text from the receipt and extract the required details.
Return only JSON strictly matching the schema provided.
If a field is missing in the receipt, infer it where possible (e.g. common currency symbols).

Schema:
{
  "date": "YYYY-MM-DD",
  "currency": "3-character currency code",
  "vendor_name": "string",
  "receipt_items": [
    {
      "item_name": "string",
      "item_cost": "number"
    }
  ],
  "tax": "number",
  "total": "number"
}
`;

    let ocrText = '';
    try {
      ocrText = await this.ocrService.extractText(file.buffer);
    } catch (err) {
      console.error('OCR failed for OpenAI flow:', err);
      throw new InternalServerErrorException('Failed to OCR the receipt image.');
    }

    const userContent = `${prompt}\n\n[OCR TEXT]\n${ocrText}`;

    for (let i = 0; i < 3; i++) {
      try {
        const response = await this.openai.chat.completions.create({
          model,
          messages: [{ role: 'user', content: userContent }],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'receipt_schema',
              schema: {
                type: 'object',
                properties: {
                  date: { type: 'string' },
                  currency: { type: 'string' },
                  vendor_name: { type: 'string' },
                  receipt_items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        item_name: { type: 'string' },
                        item_cost: { type: 'number' },
                      },
                      required: ['item_name', 'item_cost'],
                    },
                  },
                  tax: { type: 'number' },
                  total: { type: 'number' },
                },
                required: [
                  'date',
                  'currency',
                  'vendor_name',
                  'receipt_items',
                  'total',
                ],
              },
            },
          },
        });

        const content = response.choices[0].message?.content;
        if (!content) throw new Error('Empty response from model');

        const extractedData = JSON.parse(content);

        if (
          extractedData.date &&
          extractedData.currency &&
          extractedData.vendor_name &&
          Array.isArray(extractedData.receipt_items) &&
          extractedData.total
        ) {
          return extractedData;
        }
      } catch (error) {
        console.error(
          `Attempt ${i + 1} - Error extracting receipt details with OpenAI:`,
          error?.message ?? error,
        );
      }
    }

    throw new InternalServerErrorException(
      'Failed to extract receipt details from OpenAI after 3 attempts.',
    );
  }
}
