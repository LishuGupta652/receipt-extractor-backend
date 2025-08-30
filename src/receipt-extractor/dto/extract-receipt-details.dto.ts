import { ApiProperty } from '@nestjs/swagger';

class ReceiptItemDto {
  @ApiProperty()
  item_name: string;

  @ApiProperty()
  item_cost: number;
}

export class ExtractReceiptDetailsDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  date: string;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  vendor_name: string;

  @ApiProperty({ type: [ReceiptItemDto] })
  receipt_items: ReceiptItemDto[];

  @ApiProperty()
  tax: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  image_url: string;
}