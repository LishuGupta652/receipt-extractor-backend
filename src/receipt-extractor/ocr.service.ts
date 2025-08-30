import { Injectable, InternalServerErrorException, OnModuleDestroy } from '@nestjs/common';
import { createWorker, Worker } from 'tesseract.js';

@Injectable()
export class OcrService implements OnModuleDestroy {
  private workerPromise: Promise<Worker> | null = null;

  private async getWorker(): Promise<Worker> {
    if (!this.workerPromise) {
      this.workerPromise = (async () => {
        const worker = await createWorker();
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        return worker;
      })();
    }
    return this.workerPromise;
  }

  async extractText(buffer: Buffer): Promise<string> {
    try {
      const worker = await this.getWorker();
      const { data: { text } } = await worker.recognize(buffer);
      return text || '';
    } catch (err) {
      console.error('OCR service failed:', err);
      throw new InternalServerErrorException('OCR processing failed');
    }
  }

  async onModuleDestroy() {
    if (this.workerPromise) {
      try {
        const worker = await this.workerPromise;
        await worker.terminate();
      } catch (err) {
        console.error(err);
        // TODO? maybe handle 
      }
    }
  }
}
