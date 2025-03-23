import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Medicine, MedicineDocument } from './schemas/medicines.schema';
import * as fs from 'fs';
import csvParser from 'csv-parser';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

Injectable()
export class MedicineService {
  constructor(
    @InjectModel(Medicine.name) private medicineModel: Model<MedicineDocument>,
    @InjectRedis() private readonly redis: Redis
  ) {}

  async importFromCSV(filePath: string) {
    const taskId = `task:${Date.now()}`;
    const errors = [];
    let total = 0;
    let processed = 0;
    let success = 0;

    console.log(`Starting import: ${taskId}`);

    const stream = fs.createReadStream(filePath).pipe(csvParser());

    for await (const row of stream) {
      total++;

      const id = row['ID']?.toString();
      const name = row['Name'];
      const priceRaw = row['Final Cost']?.replace('£', '').replace(',', '').trim();
      const price = parseFloat(priceRaw || '0') * 25;
      const quantity = row['Quanitty']?.toString();

      if (!id || !name || !price || !quantity) {
        errors.push({ line: total, reason: 'Missing fields' });
        console.warn(` Line ${total} skipped: Missing fields`);
        continue;
      }

      const exists = await this.medicineModel.findOne({ id }).exec();
      if (exists) {
        errors.push({ line: total, reason: 'Duplicate ID' });
        console.warn(` Line ${total} skipped: Duplicate ID`);
        continue;
      }

      try {
        await this.medicineModel.create({ id, name, price, quantity });
        success++;
      } catch (e) {
        errors.push({ line: total, reason: 'DB error' });
        console.error(`Line ${total} DB error:`, e instanceof Error ? e.message : 'Unknown error');
      }

      processed++;
      if (processed % 100 === 0) {
        console.log(`Processed ${processed}/${total} rows...`);
      }

      await this.redis.set(
        `import:medicine:${taskId}`,
        JSON.stringify({ total, processed, success, errors })
      );
    }

    console.log(`Import completed: ${success} inserted, ${errors.length} errors.`);

    return { taskId, total, processed, success, errors };
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
