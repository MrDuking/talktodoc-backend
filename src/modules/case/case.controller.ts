import { Roles } from '@/modules/auth/decorators/roles.decorator'
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'
import { RolesGuard } from '@/modules/auth/guards/roles.guard'
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface'
import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { CaseService } from './case.service'
import { AddOfferDto } from './dtos/add-offer.dto'
import { SubmitCaseDto } from './dtos/submit-case.dto'

@ApiTags('Cases')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('case')
export class CaseController {
  constructor(private readonly caseService: CaseService) {}

  @Post('data')
  @ApiOperation({ summary: 'Tạo hoặc cập nhật bệnh án (case)' })
  async submitCase(@Req() req: Request & { user?: JwtPayload }, @Body() dto: SubmitCaseDto) {
    return this.caseService.submitData(dto, req.user!)
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách bệnh án (có tìm kiếm & phân trang)' })
  @ApiQuery({ name: 'q', required: false, description: 'Từ khoá tìm kiếm' })
  @ApiQuery({ name: 'status', required: false, description: 'Trạng thái case' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(
    @Req() req: Request & { user?: JwtPayload },
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('q') q?: string,
    @Query('status') status?: string,
  ) {
    return this.caseService.findAll(req.user!, +page, +limit, q, status as any)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết bệnh án' })
  async findOne(@Req() req: Request & { user?: JwtPayload }, @Param('id') id: string) {
    return this.caseService.findOne(id, req.user!)
  }

  @Patch(':id/offer')
  @UseGuards(RolesGuard)
  @Roles('DOCTOR')
  @ApiOperation({ summary: 'Bác sĩ kê đơn thuốc (thêm offer)' })
  async addOffer(
    @Req() req: Request & { user?: JwtPayload },
    @Param('id') id: string,
    @Body() dto: AddOfferDto,
  ) {
    return this.caseService.addOffer(id, req.user!.userId, dto)
  }

  @Patch(':id/delete')
  @ApiOperation({ summary: 'Xoá mềm bệnh án' })
  async softDelete(@Req() req: Request & { user?: JwtPayload }, @Param('id') id: string) {
    return this.caseService.deleteCase(id, req.user!)
  }
}
