import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as XLSX from 'xlsx';
import { Medicine, MedicineDocument } from './schemas/medicines.schema';

@Injectable()
export class MedicineService {
  constructor(@InjectModel(Medicine.name) private medicineModel: Model<MedicineDocument>) {}

  async importExcel(buffer: Buffer): Promise<any> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    // Chuyển đổi đơn vị tiền tệ GBP -> VND
    const exchangeRate = 30000;
    const medicines = jsonData.map((item: any) => ({
      id: item.ID,
      name: item.Name,
      route: item.Route,
      dose: item.Dose,
      quantity: item.Quanitty,
      frequency: item.Frequency,
      refill: item.Refill,
      finalCost: item['Final Cost'] * exchangeRate,
      feeCost: item['Fee Cost'] * exchangeRate,
      prescriptionFee: item['Prescription Fee'] * exchangeRate || 0,
    }));

    // Lưu vào MongoDB
    await this.medicineModel.insertMany(medicines);
    return { message: 'Data imported successfully', count: medicines.length };
  }

  async getMedicines(): Promise<Medicine[]> {
    return this.medicineModel.find().exec();
  }
}
