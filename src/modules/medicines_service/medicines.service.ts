import { InjectRedis } from '@liaoliaots/nestjs-redis'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import csvParser from 'csv-parser'
import * as fs from 'fs'
import Redis from 'ioredis'
import { Model } from 'mongoose'
import { Medicine, MedicineDocument } from './schemas/medicines.schema'

@Injectable()
export class MedicineService {
  constructor(
    @InjectModel(Medicine.name) private medicineModel: Model<MedicineDocument>,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async importFromCSV(filePath: string) {
    const taskId = `${Date.now()}`
    const errors: { line: number; reason: string }[] = []
    const insertLines: number[] = []
    const updateLines: number[] = []
    const duplicateLines: number[] = []

    let totalRows = 0
    const batchSize = 200
    const buffer: any[] = []

    const stream = fs.createReadStream(filePath).pipe(csvParser())

    for await (const row of stream) {
      const line = ++totalRows

      const id = row['ID']?.trim()
      const name = row['Name']?.trim()
      const priceRaw = row['Final Cost']?.replace('£', '').replace(',', '').trim()
      const quantity = row['Quanitty']?.trim() // ⚠️ Typo: "Quanitty"
      const price = parseFloat(priceRaw || '0') * 25

      if (!id || !name || !price || !quantity) {
        console.log('Thiếu cột dữ liệu', id, name, price, quantity)
        errors.push({ line, reason: 'Thiếu cột dữ liệu' })
        continue
      }

      buffer.push({ id, name, price, quantity, line })

      if (buffer.length >= batchSize) {
        await this.processBatch(buffer, insertLines, updateLines, duplicateLines, errors)
        buffer.length = 0
      }
    }

    if (buffer.length > 0) {
      await this.processBatch(buffer, insertLines, updateLines, duplicateLines, errors)
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
    }

    await this.redis.set(`import:medicine:${taskId}`, JSON.stringify(result))

    return result
  }

  private async processBatch(
    rows: any[],
    insertLines: number[],
    updateLines: number[],
    duplicateLines: number[],
    errors: { line: number; reason: string }[],
  ) {
    const ids = rows.map(r => r.id)
    const existingDocs = await this.medicineModel.find({ id: { $in: ids } }).lean()
    const existingMap = new Map(existingDocs.map(d => [d.id, d]))

    const bulkOps = rows
      .map(({ id, name, price, quantity, line }) => {
        const existing = existingMap.get(id)
        if (existing) {
          const isDifferent =
            existing.name !== name || existing.price !== price || existing.quantity !== quantity
          if (isDifferent) {
            updateLines.push(line)
            return {
              updateOne: {
                filter: { id },
                update: { name, price, quantity },
              },
            } as const
          } else {
            duplicateLines.push(line)
            return null
          }
        } else {
          insertLines.push(line)
          return {
            insertOne: { document: { id, name, price, quantity } },
          } as const
        }
      })
      .filter((op): op is NonNullable<typeof op> => op !== null)

    try {
      if (bulkOps.length) {
        await this.medicineModel.bulkWrite(bulkOps)
      }
    } catch (e) {
      rows.forEach(r => {
        errors.push({ line: r.line, reason: 'Lỗi hệ thống' })
      })
    }
  }

  async getAll(page = 1, limit = 10, keyword?: string) {
    const skip = (page - 1) * limit
    const query = keyword
      ? {
          $or: [
            { id: { $regex: keyword, $options: 'i' } },
            { name: { $regex: keyword, $options: 'i' } },
            { quantity: { $regex: keyword, $options: 'i' } },
          ],
        }
      : {}

    const [data, total] = await Promise.all([
      this.medicineModel.find(query).skip(skip).limit(limit),
      this.medicineModel.countDocuments(query),
    ])

    return { data, total, page, limit }
  }

  async getProgress(taskId: string) {
    const raw = await this.redis.get(`import:medicine:${taskId}`)
    return raw ? JSON.parse(raw) : { message: 'No progress found' }
  }
}
