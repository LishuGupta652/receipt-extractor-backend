import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { AiService } from './ai.service';
import { GoogleModels } from '../ai-providers';
import { OcrService } from '../ocr.service';

@Injectable()
export class GoogleAiService implements AiService {
  private readonly genAI: GoogleGenerativeAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly ocrService: OcrService,
  ) {
    this.genAI = new GoogleGenerativeAI(
      this.configService.get<string>('GOOGLE_API_KEY'),
    );
  }

  async extractReceiptDetails(
    file: Express.Multer.File,
    model: string = GoogleModels.GEMINI_2_5_PRO,
  ): Promise<any> {
    const generativeModel = this.genAI.getGenerativeModel({
      model,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            date: { type: SchemaType.STRING },
            currency: { type: SchemaType.STRING },
            vendor_name: { type: SchemaType.STRING },
            receipt_items: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  item_name: { type: SchemaType.STRING },
                  item_cost: { type: SchemaType.NUMBER },
                },
                required: ['item_name', 'item_cost'],
              },
            },
            tax: { type: SchemaType.NUMBER },
            total: { type: SchemaType.NUMBER },
          },
          required: ['date', 'currency', 'vendor_name', 'receipt_items', 'total'],
        },
      },
    });

    const prompt = `
You are a receipt extraction assistant. 
Analyze the OCR text of the receipt and extract the required details.
Return only JSON strictly matching the schema provided.
If a field is missing in the receipt, infer it where possible (e.g. detect currency symbol).
Ensure dates are normalized to YYYY-MM-DD format.

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
      console.error('OCR failed for Google AI flow:', err);
      throw new InternalServerErrorException('Failed to OCR the receipt image.');
    }

    for (let i = 0; i < 3; i++) {
      try {
        const result = await generativeModel.generateContent([
          `${prompt}\n\n[OCR TEXT]\n${ocrText}`,
        ]);
        const response = await result.response;
        const text = response.text();

        const extractedData = JSON.parse(text);

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
          `Attempt ${i + 1} - Error extracting receipt details with Google AI:`,
          error?.message ?? error,
        );
      }
    }

    throw new InternalServerErrorException(
      'Failed to extract receipt details from Google AI after 3 attempts.',
    );
  }
}
