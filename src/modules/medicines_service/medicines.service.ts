import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Medicine, MedicineDocument } from './schemas/medicines.schema';
import * as fs from 'fs';
import csvParser from 'csv-parser';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class MedicineService {
  constructor(
    @InjectModel(Medicine.name) private medicineModel: Model<MedicineDocument>,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async importFromCSV(filePath: string) {
    const taskId = `${Date.now()}`;
    const errors: { line: number; reason: string }[] = [];
    const insertLines: number[] = [];
    const updateLines: number[] = [];
    const duplicateLines: number[] = [];

    let totalRows = 0;
    const batchSize = 200;
    const buffer: any[] = [];

    const stream = fs.createReadStream(filePath).pipe(csvParser());

    for await (const row of stream) {
      const line = ++totalRows;

      const id = row['ID']?.trim();
      const name = row['Name']?.trim();
      const priceRaw = row['Final Cost']?.replace('£', '').replace(',', '').trim();
      const quantity = row['Quanitty']?.trim();
      const price = parseFloat(priceRaw || '0') * 25;

      if (!id || !name || !price || !quantity) {
        errors.push({ line, reason: 'Missing fields' });
        continue;
      }

      buffer.push({ id, name, price, quantity, line });

      if (buffer.length >= batchSize) {
        await this.processBatch(buffer, insertLines, updateLines, duplicateLines, errors);
        buffer.length = 0;
      }
    }

    if (buffer.length > 0) {
      await this.processBatch(buffer, insertLines, updateLines, duplicateLines, errors);
    }

    const result = {
      taskId,
      totalRows,
      success: {
        count: insertLines.length,
        lines: insertLines,
      },
      updated: {
        count: updateLines.length,
        lines: updateLines,
      },
      failed: {
        count: errors.length,
        lines: errors,
      },
      duplicates: {
        count: duplicateLines.length,
        lines: duplicateLines,
      },
    };

    await this.redis.set(`import:medicine:${taskId}`, JSON.stringify(result));

    return result;
  }

  private async processBatch(
    rows: any[],
    insertLines: number[],
    updateLines: number[],
    duplicateLines: number[],
    errors: { line: number; reason: string }[]
  ) {
    const ids = rows.map((r) => r.id);
    const existingDocs = await this.medicineModel.find({ id: { $in: ids } }).lean();
    const existingMap = new Map(existingDocs.map((d) => [d.id, d]));

    const bulkOps = rows.map(({ id, name, price, quantity, line }) => {
      const existing = existingMap.get(id);
      if (existing) {
        const isDifferent = existing.name !== name || existing.price !== price || existing.quantity !== quantity;
        if (isDifferent) {
          updateLines.push(line);
          return {
            updateOne: {
              filter: { id },
              update: { name, price, quantity },
            },
          } as const;
        } else {
          duplicateLines.push(line);
          return null;
        }
      } else {
        insertLines.push(line);
        return {
          insertOne: { document: { id, name, price, quantity } },
        } as const;
      }
    }).filter((op): op is NonNullable<typeof op> => op !== null);

    try {
      if (bulkOps.length) {
        await this.medicineModel.bulkWrite(bulkOps);
      }
    } catch (e) {
      rows.forEach((r) => {
        errors.push({ line: r.line, reason: 'DB error' });
      });
    }
  }

  async getAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const data = await this.medicineModel.find().skip(skip).limit(limit);
    const total = await this.medicineModel.countDocuments();
    return { data, total, page, limit };
  }

  async getProgress(taskId: string) {
    const raw = await this.redis.get(`import:medicine:${taskId}`);
    return raw ? JSON.parse(raw) : { message: 'No progress found' };
  }
}
