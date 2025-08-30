import { IsEnum, IsOptional } from 'class-validator';
import { AiProvider, GoogleModels, OpenAiModels } from '../ai-providers';
import { ApiProperty } from '@nestjs/swagger';

export class ExtractReceiptDetailsRequestDto {
  @ApiProperty({ enum: AiProvider, enumName: 'AiProvider' })
  @IsEnum(AiProvider)
  aiProvider: AiProvider;

  @ApiProperty({ enum: [...Object.values(GoogleModels), ...Object.values(OpenAiModels)], required: false })
  @IsOptional()
  model?: GoogleModels | OpenAiModels;
}