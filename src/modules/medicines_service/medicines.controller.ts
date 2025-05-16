import { Controller, Get, Param, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { diskStorage } from 'multer'
import { MedicineService } from './medicines.service'

@ApiTags('Medicines')
@Controller('api/v1/medicines')
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) {}

  @ApiOperation({ summary: 'Import or update medicines from a CSV file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Medicines imported or updated successfully' })
  @Post('import')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
      }),
    }),
  )
  importMedicineCSV(@UploadedFile() file: Express.Multer.File) {
    return this.medicineService.importFromCSV(file.path)
  }

  @ApiOperation({ summary: 'Get all medicines with pagination and optional search' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'keyword', required: false, example: 'Paracetamol' })
  @ApiResponse({ status: 200, description: 'Return list of medicines' })
  @Get()
  getAll(@Query('page') page = 1, @Query('limit') limit = 10, @Query('keyword') keyword?: string) {
    return this.medicineService.getAll(+page, +limit, keyword)
  }

  @ApiOperation({ summary: 'Get import progress by task ID' })
  @ApiParam({ name: 'taskId', description: 'Task ID returned when importing CSV' })
  @ApiResponse({ status: 200, description: 'Return progress of import task' })
  @Get('progress/:taskId')
  getProgress(@Param('taskId') taskId: string) {
    return this.medicineService.getProgress(taskId)
  }
}
