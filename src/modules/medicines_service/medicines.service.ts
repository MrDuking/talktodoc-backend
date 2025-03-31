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
    const taskId = `task:${Date.now()}`;
    const errors: { line: number; reason: string }[] = [];
    const updates: number[] = [];
    const created: number[] = [];
    const duplicatesInBatch: number[] = [];
    const alreadyExists: number[] = [];

    let total = 0;
    let processed = 0;
    const batchSize = 200;
    const buffer: any[] = [];

    const stream = fs.createReadStream(filePath).pipe(csvParser());

    const toRedis = async () => {
      await this.redis.set(
        `import:medicine:${taskId}`,
        JSON.stringify({
          total,
          processed,
          created: created.length,
          updated: updates.length,
          duplicateInBatch: duplicatesInBatch.length,
          alreadyExists: alreadyExists.length,
          failed: errors.length,
          errors,
        })
      );
    };

    for await (const row of stream) {
      total++;
      const line = total;
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
        await this.processBatch(buffer, { created, updates, duplicatesInBatch, alreadyExists, errors });
        processed += buffer.length;
        buffer.length = 0;
        await toRedis();
      }
    }

    if (buffer.length > 0) {
      await this.processBatch(buffer, { created, updates, duplicatesInBatch, alreadyExists, errors });
      processed += buffer.length;
      await toRedis();
    }

    await toRedis();

    return {
      taskId,
      total,
      processed,
      created: created.length,
      updated: updates.length,
      duplicateInBatch: duplicatesInBatch.length,
      alreadyExists: alreadyExists.length,
      failed: errors.length,
      errors,
    };
  }

  private async processBatch(
    rows: any[],
    statusTrackers: {
      created: number[];
      updates: number[];
      duplicatesInBatch: number[];
      alreadyExists: number[];
      errors: { line: number; reason: string }[];
    }
  ) {
    const { created, updates, duplicatesInBatch, alreadyExists, errors } = statusTrackers;

    const seen = new Set<string>();
    const uniqueRows = [];

    for (const row of rows) {
      if (seen.has(row.id)) {
        duplicatesInBatch.push(row.line);
      } else {
        seen.add(row.id);
        uniqueRows.push(row);
      }
    }

    const ids = uniqueRows.map((r) => r.id);
    const existingDocs = await this.medicineModel.find({ id: { $in: ids } }).lean();
    const existingMap = new Map(existingDocs.map((d) => [d.id, d]));

    const bulkOps = uniqueRows.map(({ id, name, price, quantity, line }) => {
      const existing = existingMap.get(id);
      if (existing) {
        const isDifferent = existing.name !== name || existing.price !== price || existing.quantity !== quantity;
        if (isDifferent) {
          updates.push(line);
          return {
            updateOne: {
              filter: { id },
              update: { name, price, quantity },
            },
          } as const;
        } else {
          alreadyExists.push(line);
          return null;
        }
      } else {
        created.push(line);
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
      uniqueRows.forEach((r) => {
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