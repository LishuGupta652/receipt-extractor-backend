export abstract class AiService {
  abstract extractReceiptDetails(file: Express.Multer.File, model?: string): Promise<any>;
}
